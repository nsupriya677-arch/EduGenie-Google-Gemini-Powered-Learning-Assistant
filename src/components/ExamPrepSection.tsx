import React, { useState } from 'react';
import { GraduationCap, Sparkles, Download, Copy, Check, Printer, FileCheck } from 'lucide-react';
import { SubjectCategory } from '../types';

interface Props {
  activeSubject: SubjectCategory;
}

const PRESET_EXAM_TOPICS: Record<SubjectCategory, string[]> = {
  'Computer Science': ['Relational Database Normalization (1NF, 2NF, 3NF, BCNF)', 'Graph Traversal (BFS vs DFS)', 'Process Synchronization & Semaphores'],
  'Mathematics': ['Differential Calculus & Maxima/Minima', 'Probability Distributions (Binomial & Poisson)', 'Linear Systems & Cramer Rule'],
  'Science': ['Thermodynamics Laws & Carnot Cycle', 'Chemical Bonding & Hybridization', 'Genetics & Mendelian Inheritance'],
  'Commerce': ['Cash Flow Statement (Direct vs Indirect)', 'Macroeconomics Inflation & Philips Curve', 'Capital Asset Pricing Model (CAPM)'],
  'Humanities': ['Cold War Geopolitics & Ideological Conflict', 'Structuralism in Linguistics', 'Social Stratification & Mobility'],
  'General': ['Environmental Pollution & Carbon Footprint', 'Microbial Pathogens & Immune Response', 'Renewable Energy Technologies'],
};

export const ExamPrepSection: React.FC<Props> = ({ activeSubject }) => {
  const [topic, setTopic] = useState('Relational Database Normalization');
  const [examType, setExamType] = useState('University Semester Exam');
  const [targetMarks, setTargetMarks] = useState('Mixed (2M, 5M & 10M)');
  const [examKit, setExamKit] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = PRESET_EXAM_TOPICS[activeSubject] || PRESET_EXAM_TOPICS['General'];

  const handleGenerate = async (topicToUse?: string) => {
    const t = (topicToUse || topic).trim();
    if (!t || loading) return;
    if (topicToUse) setTopic(topicToUse);

    setLoading(true);
    setExamKit('Formulating high-yield exam questions and marking schemes...');

    try {
      const res = await fetch('/api/exam-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          subject: activeSubject,
          examType,
          targetMarks,
        }),
      });

      const data = await res.json();
      setExamKit(data.examKit || data.error || 'Failed to generate exam prep pack.');
    } catch (err: any) {
      setExamKit(`⚠️ Error: ${err.message || 'Unable to build exam prep kit.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!examKit) return;
    navigator.clipboard.writeText(examKit);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!examKit) return;
    const blob = new Blob([examKit], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_exam_prep.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">5. 📖 Exam Preparation</h2>
            <p className="text-xs text-slate-500">Generates high-yield 2M, 5M, and 10M questions with marking schemes and revision cheat sheets</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-800">
          Marking Rubrics
        </span>
      </div>

      {/* High yield presets */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>High-yield exam topics for {activeSubject}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(preset)}
              className="text-xs bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Target Syllabus Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Database Normalization, Carnot Cycle..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Exam Type / Standard</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          >
            <option value="University Semester Exam">University Semester Exam</option>
            <option value="High School Board / AP Exam">High School Board / AP Exam</option>
            <option value="Competitive Entrance Exam">Competitive Entrance Exam (GRE/GATE/JEE)</option>
            <option value="Final Midterm Revision">Final Midterm Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Target Mark Distribution</label>
          <select
            value={targetMarks}
            onChange={(e) => setTargetMarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          >
            <option value="Mixed (2M, 5M & 10M)">Mixed (2M, 5M & 10M)</option>
            <option value="Short Answers Focus (2M & 3M)">Short Answers Focus (2M & 3M)</option>
            <option value="Long Essay / Numerical Focus (10M)">Long Essay / Numerical Focus (10M)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Formulating Exam Kit...</span>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>Generate Exam Prep Pack</span>
            </>
          )}
        </button>
      </div>

      {/* Output card */}
      {examKit && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-md uppercase">
                {topic}
              </span>
              <span className="text-xs text-slate-500">({examType})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {examKit}
          </div>
        </div>
      )}
    </section>
  );
};
