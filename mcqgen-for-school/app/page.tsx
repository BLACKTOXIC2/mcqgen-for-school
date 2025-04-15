import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MCQ Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered MCQ Generator for Schools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Generate high-quality multiple choice questions instantly using AI. Perfect for teachers and educators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Start</h2>
              <ol className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                <li>1. Enter your topic or subject</li>
                <li>2. Select difficulty level</li>
                <li>3. Choose number of questions</li>
                <li>4. Generate and download</li>
              </ol>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Features</h2>
              <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2">
                <li>✓ AI-generated questions</li>
                <li>✓ Multiple difficulty levels</li>
                <li>✓ Customizable options</li>
                <li>✓ Export to PDF/Word</li>
              </ul>
            </div>
          </div>

          <Link
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Get Started
          </Link>
        </div>
      </main>

      <footer className="mt-16 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 MCQ Generator for Schools. All rights reserved.</p>
      </footer>
    </div>
  );
}
