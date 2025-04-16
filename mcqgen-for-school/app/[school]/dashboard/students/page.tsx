'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Student {
  id: string;
  name: string;
  roll_no: string;
  class_id: string;
  school_id: string;
  status: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  school_id: string;
}

interface School {
  id: string;
  name: string;
}

interface PageProps {
  params: Promise<{
    school: string;
  }>;
}

export default function StudentsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
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

        // First, get the school ID from the school name
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id')
          .eq('name', resolvedParams.school)
          .single();

        if (schoolError) throw schoolError;
        if (!schoolData) {
          throw new Error('School not found');
        }

        setSchoolId(schoolData.id);
        console.log('School ID:', schoolData.id);

        // Fetch classes for the current school
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolData.id);

        if (classesError) throw classesError;
        console.log('Classes data:', classesData);
        setClasses(classesData || []);

        // Fetch students for the current school
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', schoolData.id);

        if (studentsError) throw studentsError;
        console.log('Students data:', studentsData);
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.school, router, supabase]);

  const filteredStudents = selectedClass
    ? students.filter(student => student.class_id === selectedClass)
    : students;

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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Students</h1>
        
        <div className="mb-4">
          <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Class
          </label>
          <select
            id="class-filter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.grade} {cls.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {students.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No students found. Please add some students to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentClass = classes.find(cls => cls.id === student.class_id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.roll_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {studentClass ? `${studentClass.name} - ${studentClass.grade} ${studentClass.section}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 