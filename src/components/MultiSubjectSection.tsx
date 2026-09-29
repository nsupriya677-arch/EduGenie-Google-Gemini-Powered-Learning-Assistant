import React from 'react';
import { Globe2, Laptop, Calculator, Microscope, Briefcase, Landmark, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { SubjectCategory } from '../types';

interface Props {
  activeSubject: SubjectCategory;
  onSelectSubject: (sub: SubjectCategory) => void;
  onLaunchTopic: (topic: string, sub: SubjectCategory, tool: 'notes' | 'quiz' | 'exam' | 'assistant') => void;
}

const SUBJECT_CATALOG = [
  {
    category: 'Computer Science' as SubjectCategory,
    icon: Laptop,
    color: 'border-blue-200 bg-blue-50/50 text-blue-700',
    description: 'Algorithms, Data Structures, Operating Systems, Networks, DB & Web Dev',
    topics: [
      { name: 'Binary Search Algorithm', tool: 'quiz' },
      { name: 'Operating System Deadlocks', tool: 'notes' },
      { name: 'TCP/IP vs OSI Model', tool: 'assistant' },
      { name: 'Database Normalization (3NF/BCNF)', tool: 'exam' },
    ],
  },
  {
    category: 'Mathematics' as SubjectCategory,
    icon: Calculator,
    color: 'border-amber-200 bg-amber-50/50 text-amber-700',
    description: 'Calculus, Linear Algebra, Probability, Discrete Math, Statistics & Geometry',
    topics: [
      { name: 'Pythagoras theorem', tool: 'quiz' },
      { name: 'Integration by Parts & Substitution', tool: 'notes' },
      { name: 'Eigenvalues & Matrix Transformations', tool: 'notes' },
      { name: 'Bayes Theorem in Probability', tool: 'assistant' },
    ],
  },
  {
    category: 'Science' as SubjectCategory,
    icon: Microscope,
    color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
    description: 'Physics, Organic & Inorganic Chemistry, Cellular Biology, Ecology',
    topics: [
      { name: 'Cellular Respiration & ATP Cycle', tool: 'notes' },
      { name: 'Thermodynamics & Carnot Efficiency', tool: 'exam' },
      { name: 'Solar System Planetary Orbits', tool: 'quiz' },
      { name: 'CRISPR Cas9 Gene Editing', tool: 'notes' },
    ],
  },
  {
    category: 'Commerce' as SubjectCategory,
    icon: Briefcase,
    color: 'border-teal-200 bg-teal-50/50 text-teal-700',
    description: 'Microeconomics, Macroeconomics, Accounting, Financial Analysis, Business Studies',
    topics: [
      { name: 'Supply & Demand Price Elasticity', tool: 'notes' },
      { name: 'Double-Entry Bookkeeping Principles', tool: 'exam' },
      { name: 'Monetary vs Fiscal Policy', tool: 'assistant' },
      { name: 'Cash Flow Statement (Direct vs Indirect)', tool: 'notes' },
    ],
  },
  {
    category: 'Humanities' as SubjectCategory,
    icon: Landmark,
    color: 'border-purple-200 bg-purple-50/50 text-purple-700',
    description: 'World History, Cognitive Psychology, Sociology, Literature & Political Science',
    topics: [
      { name: 'Causes of World War I', tool: 'notes' },
      { name: 'Pavlov Classical Conditioning', tool: 'assistant' },
      { name: 'Cold War Geopolitics & Ideologies', tool: 'exam' },
      { name: 'Cognitive Biases in Decision Making', tool: 'notes' },
    ],
  },
];

export const MultiSubjectSection: React.FC<Props> = ({
  activeSubject,
  onSelectSubject,
  onLaunchTopic,
}) => {
  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">11. 🌐 Multi-Subject Academic Support</h2>
            <p className="text-xs text-slate-500">Comprehensive curriculum coverage across STEM, Commerce, and Humanities disciplines</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100/70 text-indigo-800">
          5 Core Disciplines
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECT_CATALOG.map((sub) => {
          const Icon = sub.icon;
          const isSelected = activeSubject === sub.category;

          return (
            <div
              key={sub.category}
              className={`p-5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${sub.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{sub.category}</h3>
                </div>
                <button
                  onClick={() => onSelectSubject(sub.category)}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded-full transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Active Subject' : 'Select'}
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{sub.description}</p>

              <div>
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Featured Core Topics:
                </span>
                <div className="space-y-1.5">
                  {sub.topics.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => onLaunchTopic(t.name, sub.category, t.tool as any)}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100/80 text-xs text-slate-700 hover:text-indigo-700 transition text-left group cursor-pointer"
                    >
                      <span className="truncate mr-1 font-medium">{t.name}</span>
                      <span className="inline-flex items-center text-2xs text-slate-400 group-hover:text-indigo-600 font-semibold shrink-0">
                        {t.tool === 'quiz' ? 'Quiz' : t.tool === 'notes' ? 'Notes' : t.tool === 'exam' ? 'Exam' : 'Ask'}
                        <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
