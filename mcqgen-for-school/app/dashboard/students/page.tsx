'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon, 
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface Student {
  id: string
  name: string
  roll_no: string
  class_id: string
  school_id: string
  status: string
  created_at: string
  updated_at: string
}

// Constants
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Teachers', href: '/dashboard/teachers', icon: AcademicCapIcon },
  { name: 'Classes', href: '/dashboard/classes', icon: BuildingOfficeIcon },
  { name: 'Students', href: '/dashboard/students', icon: UserIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

export default function StudentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [newStudent, setNewStudent] = useState({
    name: '',
    roll_no: '',
    class_id: '',
    school_id: '',
    status: 'active'
  })
  const [classes, setClasses] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])

  // Initialize page
  useEffect(() => {
    const initializePage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }
        setUser(user)
        await Promise.all([fetchStudents(), fetchClasses(), fetchSchools()])
      } catch (error) {
        console.error('Error initializing page:', error)
        alert('Failed to load page data. Please try again.')
      }
    }

    initializePage()
  }, [router])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Failed to fetch students. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
      alert('Failed to fetch classes. Please try again.')
    }
  }

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSchools(data || [])
      
      // Set default school_id if there's only one school
      if (data && data.length === 1) {
        setNewStudent(prev => ({ ...prev, school_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
      alert('Failed to fetch schools. Please try again.')
    }
  }

  const handleAddStudent = async () => {
    try {
      // Validate required fields
      if (!newStudent.name.trim()) {
        alert('Please enter student name')
        return
      }
      if (!newStudent.roll_no.trim()) {
        alert('Please enter roll number')
        return
      }
      if (!newStudent.class_id) {
        alert('Please select a class')
        return
      }
      if (!newStudent.school_id) {
        alert('Please select a school')
        return
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: newStudent.name.trim(),
          roll_no: newStudent.roll_no.trim(),
          class_id: newStudent.class_id,
          school_id: newStudent.school_id,
          status: newStudent.status
        }])
        .select()

      if (error) {
        if (error.code === '23505') {
          alert('A student with this roll number already exists in this school')
          return
        }
        throw error
      }

      setStudents([...students, data[0]])
      setIsAddModalOpen(false)
      setNewStudent({
        name: '',
        roll_no: '',
        class_id: '',
        school_id: newStudent.school_id, // Preserve the school_id for next addition
        status: 'active'
      })
      alert('Student added successfully!')
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student)
    setNewStudent({
      name: student.name,
      roll_no: student.roll_no,
      class_id: student.class_id,
      school_id: student.school_id,
      status: student.status
    })
    setIsEditModalOpen(true)
  }

  const handleEditStudent = async () => {
    try {
      // Validate required fields
      if (!newStudent.name.trim()) {
        alert('Please enter student name')
        return
      }
      if (!newStudent.roll_no.trim()) {
        alert('Please enter roll number')
        return
      }
      if (!newStudent.class_id) {
        alert('Please select a class')
        return
      }
      if (!newStudent.school_id) {
        alert('Please select a school')
        return
      }

      const { data, error } = await supabase
        .from('students')
        .update({
          name: newStudent.name.trim(),
          roll_no: newStudent.roll_no.trim(),
          class_id: newStudent.class_id,
          school_id: newStudent.school_id,
          status: newStudent.status
        })
        .eq('id', selectedStudent?.id)
        .select()

      if (error) {
        if (error.code === '23505') {
          alert('A student with this roll number already exists in this school')
          return
        }
        throw error
      }

      setStudents(students.map(s => s.id === selectedStudent?.id ? data[0] : s))
      setIsEditModalOpen(false)
      setSelectedStudent(null)
      setNewStudent({
        name: '',
        roll_no: '',
        class_id: '',
        school_id: newStudent.school_id,
        status: 'active'
      })
      alert('Student updated successfully!')
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student. Please try again.')
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id)

      if (error) throw error

      setStudents(students.filter(s => s.id !== student.id))
      alert('Student deleted successfully!')
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student. Please try again.')
    }
  }

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MCQ Generator</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  item.href === '/dashboard/students'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-sm text-red-600 hover:text-red-700"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Students</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Student
              </button>
            </div>

            {/* Add Student Modal */}
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen p-4">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New Student
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter student name"
                        />
                      </div>

                      <div>
                        <label htmlFor="roll_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          name="roll_no"
                          id="roll_no"
                          value={newStudent.roll_no}
                          onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter roll number"
                        />
                      </div>

                      <div>
                        <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Class
                        </label>
                        <select
                          name="class_id"
                          id="class_id"
                          value={newStudent.class_id}
                          onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select a class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          School
                        </label>
                        <select
                          name="school_id"
                          id="school_id"
                          value={newStudent.school_id}
                          onChange={(e) => setNewStudent({ ...newStudent, school_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select a school</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={newStudent.status}
                          onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="min-w-full">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search by name or roll number..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          School
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {student.roll_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {classes.find(c => c.id === student.class_id)?.name || student.class_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {schools.find(s => s.id === student.school_id)?.name || student.school_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditClick(student)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen p-4">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Student
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter student name"
                        />
                      </div>

                      <div>
                        <label htmlFor="roll_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          name="roll_no"
                          id="roll_no"
                          value={newStudent.roll_no}
                          onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter roll number"
                        />
                      </div>

                      <div>
                        <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          School
                        </label>
                        <select
                          name="school_id"
                          id="school_id"
                          value={newStudent.school_id}
                          onChange={(e) => setNewStudent({ ...newStudent, school_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select a school</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Class
                        </label>
                        <select
                          name="class_id"
                          id="class_id"
                          value={newStudent.class_id}
                          onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select a class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={newStudent.status}
                          onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(false)
                          setSelectedStudent(null)
                          setNewStudent({
                            name: '',
                            roll_no: '',
                            class_id: '',
                            school_id: newStudent.school_id,
                            status: 'active'
                          })
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditStudent}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 