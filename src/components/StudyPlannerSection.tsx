import React, { useState } from 'react';
import { Calendar, Clock, CheckSquare, Sparkles, Copy, Check, Download } from 'lucide-react';
import { SubjectCategory } from '../types';

interface Props {
  activeSubject: SubjectCategory;
}

export const StudyPlannerSection: React.FC<Props> = ({ activeSubject }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([activeSubject, 'Mathematics']);
  const [daysUntilExam, setDaysUntilExam] = useState(14);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [weakAreas, setWeakAreas] = useState('Graph algorithms, integration by parts, formulas');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const allSubjects = ['Computer Science', 'Mathematics', 'Science', 'Commerce', 'Humanities'];

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length === 0 || loading) return;

    setLoading(true);
    setPlan('Synthesizing your personalized study schedule and pomodoro rhythm...');

    try {
      const res = await fetch('/api/study-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          daysUntilExam,
          hoursPerDay,
          weakAreas,
        }),
      });

      const data = await res.json();
      setPlan(data.plan || data.error || 'Failed to generate study plan.');
    } catch (err: any) {
      setPlan(`⚠️ Error: ${err.message || 'Unable to build study plan.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!plan) return;
    const blob = new Blob([plan], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_plan_${daysUntilExam}_days.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">6. 📅 Personalized Study Planner</h2>
            <p className="text-xs text-slate-500">Creates an adaptive timetable based on subjects, daily time, exam countdown, and weak spots</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100/70 text-teal-800">
          Spaced Repetition
        </span>
      </div>

      {/* Inputs */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Select Subjects to Include</label>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((sub) => {
              const active = selectedSubjects.includes(sub);
              return (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    active
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Days Until Exam: <span className="font-bold text-teal-700">{daysUntilExam} Days</span>
            </label>
            <input
              type="range"
              min={3}
              max={60}
              value={daysUntilExam}
              onChange={(e) => setDaysUntilExam(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Available Daily Time: <span className="font-bold text-teal-700">{hoursPerDay} Hours/Day</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Weak Focus Topics (Optional)</label>
            <input
              type="text"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              placeholder="e.g. Recursion, Proofs, Formulas"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleGenerate}
          disabled={loading || selectedSubjects.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Architecting Schedule...</span>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>Generate My Study Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {plan && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-md uppercase">
                {daysUntilExam} Day Road-Map
              </span>
              <span className="text-xs text-slate-500">
                ({daysUntilExam * hoursPerDay} Total Study Hours)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Plan'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Plan</span>
              </button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {plan}
          </div>
        </div>
      )}
    </section>
  );
};
