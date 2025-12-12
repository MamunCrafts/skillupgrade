'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Course, Question, QuestionType, Option } from '../../../types';
import { storage } from '../../../services/storage';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const unwrappedParams = use(params);

  const [isAddingQ, setIsAddingQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('single');
  const [options, setOptions] = useState<Option[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [correctIds, setCorrectIds] = useState<string[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadCourse();
  }, [unwrappedParams.id]);

  const loadCourse = () => {
    const courses = storage.getCourses();
    const found = courses.find(c => c.id === unwrappedParams.id);
    if (found) setCourse(found);
    else router.push('/admin');
  };

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: '' }]);
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
    setCorrectIds(correctIds.filter(cid => cid !== id));
  };

  const toggleCorrect = (id: string) => {
    if (qType === 'single') {
      setCorrectIds([id]);
    } else {
      if (correctIds.includes(id)) {
        setCorrectIds(correctIds.filter(cid => cid !== id));
      } else {
        setCorrectIds([...correctIds, id]);
      }
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    if (correctIds.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: qText,
      type: qType,
      options: options.filter(o => o.text.trim() !== ''),
      correctOptionIds: correctIds
    };

    const updatedCourse = {
      ...course,
      questions: [...course.questions, newQuestion]
    };

    storage.saveCourse(updatedCourse);
    setCourse(updatedCourse);
    resetQForm();
  };

  const resetQForm = () => {
    setIsAddingQ(false);
    setQText('');
    setQType('single');
    setOptions([{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }]);
    setCorrectIds([]);
  };

  const deleteQuestion = (qId: string) => {
    if (!course) return;
    if (confirm('Delete this question?')) {
      const updatedCourse = {
        ...course,
        questions: course.questions.filter(q => q.id !== qId)
      };
      storage.saveCourse(updatedCourse);
      setCourse(updatedCourse);
    }
  };

  if (loading || !user || !course) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 pb-20">
      <div className="mb-8">
        <button onClick={() => router.push('/admin')} className="text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-2 transition">
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-extrabold gradient-text mb-2">{course.title}</h1>
        <p className="text-slate-500">{course.description}</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Questions <span className="text-slate-400">({course.questions.length})</span>
        </h2>
        <button 
          onClick={() => setIsAddingQ(!isAddingQ)}
          className="btn-glow px-6 py-3 rounded-xl text-white font-semibold"
        >
          {isAddingQ ? '✕ Cancel' : '+ Add Question'}
        </button>
      </div>

      {isAddingQ && (
        <div className="glass-card p-8 mb-10 border-indigo-200">
          <h3 className="font-bold text-xl mb-4 text-slate-800">New Question</h3>
          <p className="text-slate-500 text-sm mb-4">💡 Tip: You can use **Markdown** in your question text for formatting.</p>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-slate-600">Question Text (Markdown supported)</label>
              <textarea 
                className="w-full p-4 rounded-xl min-h-[100px]" 
                value={qText} 
                onChange={e => setQText(e.target.value)}
                placeholder="What is the output of `console.log(1 + '2')`?"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-slate-600">Type</label>
              <select 
                className="w-full p-4 rounded-xl"
                value={qType}
                onChange={(e) => {
                  setQType(e.target.value as QuestionType);
                  setCorrectIds([]);
                }}
              >
                <option value="single">Single Choice (Pick One)</option>
                <option value="multiple">Multiple Choice (Pick All)</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-3 text-slate-600">Options (Check correct answers)</label>
              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input 
                      type={qType === 'single' ? 'radio' : 'checkbox'}
                      name="correctOption"
                      checked={correctIds.includes(opt.id)}
                      onChange={() => toggleCorrect(opt.id)}
                      className="w-5 h-5 accent-indigo-500 cursor-pointer"
                    />
                    <input 
                      type="text"
                      className="flex-grow p-3 rounded-xl"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      required
                    />
                    {options.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOption(opt.id)} 
                        className="w-10 h-10 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={handleAddOption} 
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
              >
                + Add Another Option
              </button>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button type="button" onClick={resetQForm} className="px-6 py-3 text-slate-500 hover:text-slate-700 transition">Cancel</button>
              <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg hover:shadow-green-500/40 transition">
                ✓ Save Question
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {course.questions.map((q, idx) => (
          <div key={q.id} className="glass-card p-6 hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <span className={`inline-block text-xs px-3 py-1 rounded-full mb-3 font-semibold uppercase tracking-wide ${q.type === 'single' ? 'bg-cyan-100 text-cyan-600' : 'bg-purple-100 text-purple-600'}`}>
                  {q.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                </span>
                <h4 className="text-lg font-medium text-slate-800">
                  <span className="text-slate-400 mr-2">Q{idx + 1}.</span> {q.text}
                </h4>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-600 text-sm transition shrink-0">
                🗑️ Delete
              </button>
            </div>
            <ul className="mt-4 space-y-2 ml-4">
              {q.options.map(opt => (
                <li 
                  key={opt.id} 
                  className={`flex items-center gap-2 text-sm ${q.correctOptionIds.includes(opt.id) ? 'text-green-600 font-medium' : 'text-slate-600'}`}
                >
                  {q.correctOptionIds.includes(opt.id) ? '✓' : '○'} {opt.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {course.questions.length === 0 && !isAddingQ && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">🤔</div>
            No questions added yet. Click "Add Question" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
