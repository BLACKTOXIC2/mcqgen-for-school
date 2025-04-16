import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the school name from the URL
  const schoolName = req.nextUrl.pathname.split('/')[1];
  
  // Skip middleware for non-school routes and auth pages
  if (!schoolName || ['auth', 'api', '_next', 'favicon.ico'].includes(schoolName)) {
    return res;
  }

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and not on auth page, redirect to auth
  if (!session && !req.nextUrl.pathname.includes('/auth')) {
    return NextResponse.redirect(new URL(`/${schoolName}/auth`, req.url));
  }

  // If on auth page and has session, redirect to dashboard
  if (session && req.nextUrl.pathname.includes('/auth')) {
    return NextResponse.redirect(new URL(`/${schoolName}/dashboard`, req.url));
  }

  // If no session, allow access to auth page
  if (!session) {
    return res;
  }

  try {
    // Check if the school exists (case-insensitive)
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .ilike('name', schoolName);

    console.log('Middleware school check:', { schools, schoolError, schoolName });

    if (schoolError) {
      console.error('Middleware school check error:', schoolError);
      return new NextResponse('Error checking school: ' + schoolError.message, { status: 500 });
    }

    if (!schools || schools.length === 0) {
      return new NextResponse('School not found. Please check the school name.', { status: 404 });
    }

    if (schools.length > 1) {
      return new NextResponse('Multiple schools found with this name. Please contact support.', { status: 400 });
    }

    const schoolData = schools[0];

    // Check if the teacher belongs to this school
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', session.user.email)
      .eq('school_id', schoolData.id)
      .single();

    console.log('Middleware teacher check:', { teacherData, teacherError });

    if (teacherError) {
      console.error('Middleware teacher check error:', teacherError);
      return new NextResponse('Error checking teacher: ' + teacherError.message, { status: 500 });
    }

    if (!teacherData) {
      return new NextResponse('Access denied. Teacher does not belong to this school.', { status: 403 });
    }

    return res;
  } catch (error: any) {
    console.error('Middleware error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const config = {
  matcher: [
    '/:school/dashboard/:path*',
    '/:school/auth',
  ],
}; 