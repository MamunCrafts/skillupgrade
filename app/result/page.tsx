'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import { ExamResult, Course } from '../types';
import { storage } from '../services/storage';
import { playSound } from '../utils/audio';
import Link from 'next/link';

function ResultContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  const [result, setResult] = useState<ExamResult | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (resultId) {
      const results = storage.getResults();
      const foundResult = results.find(r => r.id === resultId);
      if (foundResult) {
        setResult(foundResult);
        const courses = storage.getCourses();
        const foundCourse = courses.find(c => c.id === foundResult.courseId);
        if (foundCourse) {
          setCourse(foundCourse);

          const percentage = Math.round((foundResult.score / foundResult.totalQuestions) * 100);
          if (percentage >= 50) {
            setTimeout(() => playSound('success'), 500);
          } else {
            setTimeout(() => playSound('fail'), 500);
          }
        }
      }
    }
  }, [resultId]);

  if (loading || !user || !result || !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  let feedback = 'Good Effort!';
  let emoji = '👍';
  let colorClass = 'text-yellow-600';
  let bgGradient = 'from-yellow-100 to-orange-100';
  
  if (percentage >= 80) {
    feedback = 'Excellent Job!';
    emoji = '🏆';
    colorClass = 'text-green-600';
    bgGradient = 'from-green-100 to-emerald-100';
  } else if (percentage < 50) {
    feedback = 'Keep Practicing!';
    emoji = '💪';
    colorClass = 'text-red-600';
    bgGradient = 'from-red-100 to-pink-100';
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="glass-card overflow-hidden text-center">
        {/* Top Gradient Section */}
        <div className={`p-12 bg-gradient-to-br ${bgGradient}`}>
          <div className="text-7xl mb-6 animate-float">{emoji}</div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Exam Complete!</h1>
          <h2 className="text-xl text-slate-600">{course.title}</h2>
        </div>
        
        {/* Score Circle */}
        <div className="-mt-12 relative z-10">
          <div className="w-32 h-32 mx-auto rounded-full bg-white border-4 border-slate-100 flex flex-col justify-center items-center shadow-xl">
            <span className={`text-4xl font-extrabold ${colorClass}`}>{percentage}%</span>
            <span className="text-slate-400 text-xs uppercase tracking-wide">Accuracy</span>
          </div>
        </div>
        
        <div className="p-8 pt-6">
          <h3 className={`text-2xl font-bold mb-2 ${colorClass}`}>{feedback}</h3>
          <p className="text-slate-500 mb-8">
            You answered <span className="text-slate-700 font-semibold">{result.score}</span> out of <span className="text-slate-700 font-semibold">{result.totalQuestions}</span> questions correctly
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl text-left">
              <div className="text-slate-400 text-sm mb-1">📅 Date</div>
              <div className="font-semibold text-slate-700">{new Date(result.date).toLocaleDateString()}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-left">
              <div className="text-slate-400 text-sm mb-1">⏱️ Status</div>
              <div className="font-semibold text-slate-700">Completed</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition"
            >
              🏠 Back to Courses
            </Link>
            <Link 
              href={`/exam/${course.id}`} 
              className="w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-800 transition"
            >
              🔄 Retake Exam
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
