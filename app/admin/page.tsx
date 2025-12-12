'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Course } from '../types';
import { storage } from '../services/storage';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseTime, setNewCourseTime] = useState(10);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setCourses(storage.getCourses());
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: newCourseTitle,
      description: newCourseDesc,
      timeLimitMinutes: newCourseTime,
      questions: []
    };
    storage.saveCourse(newCourse);
    setIsCreating(false);
    resetForm();
    loadCourses();
  };

  const deleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      storage.deleteCourse(id);
      loadCourses();
    }
  };

  const resetForm = () => {
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseTime(10);
  };

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your courses and questions</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="btn-glow px-6 py-3 rounded-xl text-white font-semibold"
        >
          {isCreating ? '✕ Cancel' : '+ New Course'}
        </button>
      </div>

      {isCreating && (
        <div className="glass-card p-8 mb-10 border-indigo-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Course Title</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 rounded-xl"
                placeholder="e.g., Introduction to JavaScript"
                value={newCourseTitle}
                onChange={e => setNewCourseTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea 
                required 
                rows={3}
                className="w-full p-4 rounded-xl"
                placeholder="Brief description of what this course covers..."
                value={newCourseDesc}
                onChange={e => setNewCourseDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Time Limit (Minutes)</label>
              <input 
                type="number" 
                required 
                min="1"
                className="w-full p-4 rounded-xl"
                value={newCourseTime}
                onChange={e => setNewCourseTime(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)} 
                className="px-6 py-3 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition"
              >
                ✓ Save Course
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Time</th>
              <th>Questions</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-3">📭</div>
                  No courses yet. Create one to get started.
                </td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div className="font-semibold text-slate-800">{course.title}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{course.description}</div>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
                      {course.timeLimitMinutes} min
                    </span>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                      {course.questions.length} Q
                    </span>
                  </td>
                  <td className="text-right space-x-3">
                    <Link 
                      href={`/admin/course/${course.id}`} 
                      className="inline-block px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition text-sm"
                    >
                      ✏️ Edit
                    </Link>
                    <button 
                      onClick={() => deleteCourse(course.id)} 
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
