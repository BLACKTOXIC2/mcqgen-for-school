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
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Class {
  id: string
  name: string
  grade: string
  section: string
  student_count: number
  subjects: string[]
  teachers: Teacher[]
  class_teachers: {
    teachers: Teacher
  }[]
}

interface Teacher {
  id: string
  name: string
  email: string
}

interface NewClass {
  name: string
  grade: string
  section: string
  selectedTeacherIds: string[]
  subjects: string
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

export default function ClassesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [newClass, setNewClass] = useState<NewClass>({
    name: '',
    grade: '',
    section: '',
    selectedTeacherIds: [],
    subjects: ''
  })
  const [isLoading, setIsLoading] = useState(false)

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
        fetchClasses(user.id)
        fetchTeachers(user.id)
      } catch (error) {
        console.error('Error initializing page:', error)
        alert('Failed to load page data. Please try again.')
      }
    }

    initializePage()
  }, [router])

  const fetchClasses = async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          class_teachers (
            teachers (
              id,
              name,
              email
            )
          )
        `)
        .eq('school_id', schoolId)
      
      if (error) throw error
      if (data) {
        // Transform the data to match our interface
        const transformedData = data.map((cls: Class) => ({
          ...cls,
          teachers: cls.class_teachers.map((ct: { teachers: Teacher }) => ct.teachers)
        }))
        setClasses(transformedData)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchTeachers = async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name, email')
        .eq('school_id', schoolId)
      
      if (error) throw error
      if (data) setTeachers(data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleAddClass = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Basic validation
      if (!newClass.name || !newClass.grade || !newClass.section) {
        alert('Please fill in all required fields')
        return
      }

      // Create class record
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert({
          school_id: user.id,
          name: newClass.name,
          grade: newClass.grade,
          section: newClass.section,
          subjects: newClass.subjects ? newClass.subjects.split(',').map(s => s.trim()) : []
        })
        .select()
        .single()

      if (classError) throw classError

      // Add teacher relationships if teachers are selected
      if (newClass.selectedTeacherIds.length > 0) {
        const { error: teacherError } = await supabase
          .from('class_teachers')
          .insert(
            newClass.selectedTeacherIds.map(teacherId => ({
              class_id: classData.id,
              teacher_id: teacherId
            }))
          )

        if (teacherError) throw teacherError
      }

      if (classData) {
        // Fetch the updated class with teachers
        const { data: updatedClass, error: fetchError } = await supabase
          .from('classes')
          .select(`
            *,
            class_teachers (
              teachers (
                id,
                name,
                email
              )
            )
          `)
          .eq('id', classData.id)
          .single()

        if (fetchError) throw fetchError

        if (updatedClass) {
          setClasses([...classes, {
            ...updatedClass,
            teachers: updatedClass.class_teachers.map((ct: { teachers: Teacher }) => ct.teachers)
          }])
        }
        setIsAddModalOpen(false)
        setNewClass({
          name: '',
          grade: '',
          section: '',
          selectedTeacherIds: [],
          subjects: ''
        })
      }
    } catch (error: any) {
      console.error('Error adding class:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem)
    setIsEditModalOpen(true)
  }

  const handleUpdateClass = async () => {
    if (!editingClass) return

    try {
      setIsLoading(true)
      
      // Update class record
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .update({
          name: editingClass.name,
          grade: editingClass.grade,
          section: editingClass.section,
          subjects: editingClass.subjects
        })
        .eq('id', editingClass.id)
        .select()
        .single()

      if (classError) throw classError

      // Update teacher relationships
      if (editingClass.teachers.length > 0) {
        // First, delete existing relationships
        const { error: deleteError } = await supabase
          .from('class_teachers')
          .delete()
          .eq('class_id', editingClass.id)

        if (deleteError) throw deleteError

        // Then add the new relationships
        const { error: insertError } = await supabase
          .from('class_teachers')
          .insert(
            editingClass.teachers.map(teacher => ({
              class_id: editingClass.id,
              teacher_id: teacher.id
            }))
          )

        if (insertError) throw insertError
      }

      // Fetch the updated class with teachers
      const { data: updatedClass, error: fetchError } = await supabase
        .from('classes')
        .select(`
          *,
          class_teachers (
            teachers (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', editingClass.id)
        .single()

      if (fetchError) throw fetchError

      if (updatedClass) {
        setClasses(classes.map(cls => 
          cls.id === editingClass.id ? {
            ...updatedClass,
            teachers: updatedClass.class_teachers.map((ct: { teachers: Teacher }) => ct.teachers)
          } : cls
        ))
        setIsEditModalOpen(false)
        setEditingClass(null)
      }
    } catch (error: any) {
      console.error('Error updating class:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (error) throw error

      setClasses(classes.filter(cls => cls.id !== classId))
    } catch (error: any) {
      console.error('Error deleting class:', error)
      alert(`Error: ${error.message}`)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MCQ Generator</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.email}</p>
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
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MCQ Generator</h1>
            <div className="w-6"></div>
          </div>
        </div>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h2>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Class
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Class Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {classes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No classes found. Add your first class to get started.
                        </td>
                      </tr>
                    ) : (
                      classes.map((cls) => (
                        <tr key={cls.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {cls.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cls.grade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cls.section}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cls.teachers.length > 0 ? cls.teachers.map(t => t.name).join(', ') : 'Not assigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cls.student_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <button 
                              onClick={() => handleEditClass(cls)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                            >
                              <PencilIcon className="h-5 w-5 inline" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClass(cls.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Class</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grade
                </label>
                <input
                  type="text"
                  value={newClass.grade}
                  onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section
                </label>
                <input
                  type="text"
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teachers
                </label>
                <select
                  multiple
                  value={newClass.selectedTeacherIds}
                  onChange={(e) => {
                    const selectedTeacherIds = Array.from(e.target.selectedOptions, option => option.value)
                    setNewClass({ ...newClass, selectedTeacherIds })
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Hold Ctrl (or Command on Mac) to select multiple teachers
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={newClass.subjects}
                  onChange={(e) => setNewClass({ ...newClass, subjects: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Class</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingClass(null)
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Name
                </label>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grade
                </label>
                <input
                  type="text"
                  value={editingClass.grade}
                  onChange={(e) => setEditingClass({ ...editingClass, grade: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section
                </label>
                <input
                  type="text"
                  value={editingClass.section}
                  onChange={(e) => setEditingClass({ ...editingClass, section: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teachers
                </label>
                <select
                  multiple
                  value={editingClass.teachers.map(t => t.id)}
                  onChange={(e) => {
                    const selectedTeacherIds = Array.from(e.target.selectedOptions, option => option.value)
                    const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id))
                    setEditingClass({ ...editingClass, teachers: selectedTeachers })
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Hold Ctrl (or Command on Mac) to select multiple teachers
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingClass.subjects.join(', ')}
                  onChange={(e) => setEditingClass({ 
                    ...editingClass, 
                    subjects: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingClass(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClass}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 