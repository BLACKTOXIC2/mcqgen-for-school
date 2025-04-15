-- Create class_teachers junction table
CREATE TABLE IF NOT EXISTS class_teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, teacher_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_teachers_class_id ON class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher_id ON class_teachers(teacher_id);

-- Add RLS policies
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
    ON class_teachers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true); 