'use client';

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storage } from './services/storage';
import { Course } from './types';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setCourses(storage.getCourses());
  }, []);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold gradient-text mb-4">SkillUpgrade</h1>
        <p className="text-xl text-slate-500">Select a course to challenge yourself</p>
      </header>
      
      {courses.length === 0 ? (
        <div className="glass-card text-center py-20 px-8">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">No courses available yet</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Courses will appear here once they are created by an administrator.
          </p>
          {user.role === 'admin' && (
            <Link 
              href="/admin" 
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg"
            >
              <span>✨</span> Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="bg-white rounded-2xl shadow-xl group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              {/* Decorative Gradient Top */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-indigo-600 mb-2 group-hover:text-purple-600 transition-colors">
                  {course.title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-2 text-sm">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium">
                    <span>⏱️</span> {course.timeLimitMinutes} min
                  </span>
                  <span className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full font-medium">
                    <span>📝</span> {course.questions.length} Q
                  </span>
                </div>
                
                <Link 
                  href={`/exam/${course.id}`}
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Start Exam →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
