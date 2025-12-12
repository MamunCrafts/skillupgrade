'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Course, ExamResult } from '../../types';
import { storage } from '../../services/storage';
import { playSound } from '../../utils/audio';
import ReactMarkdown from 'react-markdown';

export default function ExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string[] }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const c = storage.getCourses().find(c => c.id === unwrappedParams.courseId);
    if (!c) {
      router.push('/');
      return;
    }
    setCourse(c);
    setTimeLeft(c.timeLimitMinutes * 60);
  }, [unwrappedParams.courseId, router]);

  // Separate effect to handle time expiry
  useEffect(() => {
    if (timeLeft === 0 && !isFinished && course) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished && course) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0; // Just set to 0, the other effect will handle submission
          }
          playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, course]);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const courseRef = useRef(course);
  useEffect(() => { courseRef.current = course; }, [course]);

  const handleOptionSelect = (qId: string, optId: string, type: 'single' | 'multiple') => {
    setAnswers(prev => {
      const currentSelected = prev[qId] || [];
      if (type === 'single') {
        return { ...prev, [qId]: [optId] };
      } else {
        if (currentSelected.includes(optId)) {
          return { ...prev, [qId]: currentSelected.filter(id => id !== optId) };
        } else {
          return { ...prev, [qId]: [...currentSelected, optId] };
        }
      }
    });
  };

  const handleSubmitExam = () => {
    if (isFinished || !user || !courseRef.current) return;
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentCourse = courseRef.current;
    const finalAnswers = answersRef.current;
    
    let score = 0;
    const formattedAnswers: { questionId: string; selectedOptionIds: string[] }[] = [];

    currentCourse.questions.forEach(q => {
      const selected = finalAnswers[q.id] || [];
      formattedAnswers.push({ questionId: q.id, selectedOptionIds: selected });

      const isCorrect = 
        selected.length === q.correctOptionIds.length && 
        selected.every(id => q.correctOptionIds.includes(id));
      
      if (isCorrect) score++;
    });

    const result: ExamResult = {
      id: crypto.randomUUID(),
      courseId: currentCourse.id,
      userId: user.id,
      score,
      totalQuestions: currentCourse.questions.length,
      date: Date.now(),
      answers: formattedAnswers
    };

    storage.saveResult(result);
    router.push(`/result?id=${result.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQ = course.questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto py-8 pb-20">
      {/* Header Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sticky top-20 z-10">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">{course.title}</h2>
          <div className="text-sm text-slate-500">Question {currentQIndex + 1} of {course.questions.length}</div>
        </div>
        <div className={`text-2xl font-mono font-bold px-6 py-2 rounded-xl ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-8 min-h-[400px]">
        <div className="mb-8">
          <span className={`inline-block text-xs px-4 py-1.5 rounded-full font-semibold uppercase tracking-wide mb-4 ${currentQ.type === 'single' ? 'bg-cyan-100 text-cyan-600' : 'bg-purple-100 text-purple-600'}`}>
            {currentQ.type === 'single' ? '👆 Pick One' : '✅ Pick All That Apply'}
          </span>
          
          {/* Markdown Rendered Question */}
          <div className="markdown-content text-xl text-slate-800 leading-relaxed">
            <ReactMarkdown>{currentQ.text}</ReactMarkdown>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map(opt => {
            const isSelected = (answers[currentQ.id] || []).includes(opt.id);
            return (
              <div 
                key={opt.id}
                onClick={() => handleOptionSelect(currentQ.id, opt.id, currentQ.type)}
                className={`option-card p-5 rounded-xl cursor-pointer flex items-center gap-4 ${isSelected ? 'selected' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected 
                    ? 'border-indigo-500 bg-indigo-500' 
                    : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-lg ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button 
          disabled={currentQIndex === 0}
          onClick={() => setCurrentQIndex(prev => prev - 1)}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 hover:text-slate-800 transition"
        >
          ← Previous
        </button>

        {/* Progress Dots */}
        <div className="hidden sm:flex gap-2">
          {course.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentQIndex ? 'bg-indigo-500 scale-125' : answers[course.questions[idx].id]?.length ? 'bg-green-500' : 'bg-slate-300'}`}
            />
          ))}
        </div>

        {currentQIndex < course.questions.length - 1 ? (
          <button 
            onClick={() => setCurrentQIndex(prev => prev + 1)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition"
          >
            Next →
          </button>
        ) : (
          <button 
            onClick={handleSubmitExam}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition"
          >
            🎉 Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}
