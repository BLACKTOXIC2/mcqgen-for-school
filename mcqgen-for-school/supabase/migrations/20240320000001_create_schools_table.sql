-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_email ON schools(email);

-- Add RLS policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all schools
CREATE POLICY "Allow authenticated users to read schools"
    ON schools
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert schools
CREATE POLICY "Allow authenticated users to insert schools"
    ON schools
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own school
CREATE POLICY "Allow users to update their own school"
    ON schools
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow users to delete their own school
CREATE POLICY "Allow users to delete their own school"
    ON schools
    FOR DELETE
    TO authenticated
    USING (id = auth.uid());

-- Create a function to automatically create a school when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.schools (id, name, email)
    VALUES (NEW.id, NEW.email, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a school when a user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 