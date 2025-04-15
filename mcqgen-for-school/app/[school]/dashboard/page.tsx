'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function DashboardPage({ params }: { params: { school: string } }) {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalStudents: 0,
    activeQuizzes: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch stats from your database
      const { data: questions } = await supabase
        .from('questions')
        .select('count')
        .single();

      const { data: students } = await supabase
        .from('students')
        .select('count')
        .single();

      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('count')
        .eq('status', 'active')
        .single();

      setStats({
        totalQuestions: questions?.count || 0,
        totalStudents: students?.count || 0,
        activeQuizzes: quizzes?.count || 0,
      });
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back to {params.school.toUpperCase()}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening in your school today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalQuestions}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalStudents}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.activeQuizzes}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href={`/${params.school}/dashboard/questions/new`}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">New Question</h3>
                <p className="text-sm text-gray-500">Create a new question</p>
              </div>
            </div>
          </a>

          <a
            href={`/${params.school}/dashboard/quizzes/new`}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">New Quiz</h3>
                <p className="text-sm text-gray-500">Create a new quiz</p>
              </div>
            </div>
          </a>

          <a
            href={`/${params.school}/dashboard/students/invite`}
            className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Invite Students</h3>
                <p className="text-sm text-gray-500">Add new students</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
} 