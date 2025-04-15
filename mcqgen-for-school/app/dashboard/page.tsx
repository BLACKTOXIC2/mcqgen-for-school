'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CogIcon, 
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    principal: '',
    total_students: '',
    total_teachers: '',
    logo_url: '',
    established_year: '',
    description: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        // Fetch school information
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setSchoolInfo(data)
        }
      }
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleSchoolInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSchoolInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveSchoolInfo = async () => {
    try {
      // Convert string numbers to integers
      const dataToSave = {
        ...schoolInfo,
        user_id: user.id,
        total_students: schoolInfo.total_students ? parseInt(schoolInfo.total_students) : null,
        total_teachers: schoolInfo.total_teachers ? parseInt(schoolInfo.total_teachers) : null,
        established_year: schoolInfo.established_year ? parseInt(schoolInfo.established_year) : null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('schools')
        .upsert(dataToSave)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      if (data) {
        setSchoolInfo(data[0])
        setIsEditing(false)
      }
    } catch (error: any) {
      console.error('Error saving school information:', error.message || error)
      alert('Error saving school information: ' + (error.message || 'Unknown error'))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Teachers', href: '/dashboard/teachers', icon: AcademicCapIcon },
    { name: 'Classes', href: '/dashboard/classes', icon: BuildingOfficeIcon },
    { name: 'Students', href: '/dashboard/students', icon: UserIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
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

          {/* Navigation */}
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

          {/* User Profile */}
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
        {/* Mobile Header */}
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
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* School Information Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  School Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Logo Section */}
                <div className="flex flex-col items-center space-y-4">
                  {schoolInfo.logo_url ? (
                    <img
                      src={schoolInfo.logo_url}
                      alt="School Logo"
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        name="logo_url"
                        value={schoolInfo.logo_url}
                        onChange={handleSchoolInfoChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      School Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={schoolInfo.name}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Established Year
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="established_year"
                        value={schoolInfo.established_year}
                        onChange={handleSchoolInfoChange}
                        min="1800"
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.established_year || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    School Description
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={schoolInfo.description}
                      onChange={handleSchoolInfoChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter a brief description of your school..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {schoolInfo.description || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Principal Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="principal"
                        value={schoolInfo.principal}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.principal || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Teachers
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="total_teachers"
                        value={schoolInfo.total_teachers}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.total_teachers || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={schoolInfo.address}
                      onChange={handleSchoolInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{schoolInfo.address || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={schoolInfo.phone}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.phone || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={schoolInfo.email}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.email || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Students
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="total_students"
                        value={schoolInfo.total_students}
                        onChange={handleSchoolInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{schoolInfo.total_students || 'Not set'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSchoolInfo}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Generate New MCQs
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter topic or subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    defaultValue="5"
                  />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">
                  Generate MCQs
                </button>
              </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Generations
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                No recent generations yet. Start generating MCQs to see them here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 