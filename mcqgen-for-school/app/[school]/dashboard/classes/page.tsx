'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  school_id: string;
  student_count: number;
  subjects: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface PageProps {
  params: Promise<{
    school: string;
  }>;
}

export default function ClassesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!user) {
          router.push(`/${resolvedParams.school}/auth`);
          return;
        }

        // Get the teacher's information
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', user.email)
          .single();

        if (teacherError) throw teacherError;
        if (!teacherData) {
          throw new Error('Teacher not found');
        }

        setTeacher(teacherData);

        // Get the school ID
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id')
          .eq('name', resolvedParams.school)
          .single();

        if (schoolError) throw schoolError;
        if (!schoolData) {
          throw new Error('School not found');
        }

        // Fetch classes for the current teacher
        const { data: classesData, error: classesError } = await supabase
          .from('class_teachers')
          .select(`
            classes (
              id,
              name,
              grade,
              section,
              school_id,
              student_count,
              subjects
            )
          `)
          .eq('teacher_id', teacherData.id)
          .eq('classes.school_id', schoolData.id);

        if (classesError) throw classesError;

        // Transform the data to match our interface
        const transformedClasses = classesData?.map((ct: any) => ct.classes) || [];
        setClasses(transformedClasses);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.school, router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Classes</h1>
        <p className="text-gray-600">
          Welcome, {teacher?.name}! Here are your assigned classes.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {classes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No classes assigned yet. Please contact your administrator.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade & Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cls.grade} {cls.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cls.student_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cls.subjects.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 