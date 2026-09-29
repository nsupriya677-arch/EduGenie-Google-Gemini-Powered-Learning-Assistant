import React, { useState } from 'react';
import {
  Bot,
  BookOpen,
  FileEdit,
  HelpCircle,
  GraduationCap,
  Calendar,
  Code2,
  FileSearch,
  Target,
  BarChart3,
  Globe2,
  LayoutGrid,
  Menu,
  X,
  Flame,
} from 'lucide-react';
import { FeatureTabId, SubjectCategory } from '../types';

interface HeaderProps {
  activeTab: FeatureTabId;
  setActiveTab: (tab: FeatureTabId) => void;
  activeSubject: SubjectCategory;
  setActiveSubject: (subject: SubjectCategory) => void;
  streakDays?: number;
}

export const NAV_ITEMS = [
  { id: 'assistant' as FeatureTabId, label: 'AI Assistant', icon: Bot, number: '1' },
  { id: 'notes' as FeatureTabId, label: 'Smart Notes', icon: BookOpen, number: '2' },
  { id: 'summarizer' as FeatureTabId, label: 'Summarizer', icon: FileEdit, number: '3' },
  { id: 'quiz' as FeatureTabId, label: 'Quiz Gen', icon: HelpCircle, number: '4' },
  { id: 'exam' as FeatureTabId, label: 'Exam Prep', icon: GraduationCap, number: '5' },
  { id: 'planner' as FeatureTabId, label: 'Study Plan', icon: Calendar, number: '6' },
  { id: 'coding' as FeatureTabId, label: 'Coding Lab', icon: Code2, number: '7' },
  { id: 'material' as FeatureTabId, label: 'Document QA', icon: FileSearch, number: '8' },
  { id: 'personalized' as FeatureTabId, label: 'Adaptive', icon: Target, number: '9' },
  { id: 'progress' as FeatureTabId, label: 'Progress', icon: BarChart3, number: '10' },
  { id: 'subjects' as FeatureTabId, label: 'Subjects', icon: Globe2, number: '11' },
  { id: 'all' as FeatureTabId, label: 'Full Canvas', icon: LayoutGrid, number: '12' },
];

export const SUBJECT_OPTIONS: SubjectCategory[] = [
  'Computer Science',
  'Mathematics',
  'Science',
  'Commerce',
  'Humanities',
  'General',
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeSubject,
  setActiveSubject,
  streakDays = 3,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: FeatureTabId) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSelectTab('all')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  EduGenie
                </span>
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  AI
                </span>
              </div>
              <p className="text-2xs text-slate-500 hidden sm:block -mt-0.5">
                Intelligent Academic Suite
              </p>
            </div>
          </button>
        </div>

        {/* Center: Global Subject Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {SUBJECT_OPTIONS.map((sub) => {
            const isSelected = activeSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Right: Streak & Mobile toggle */}
        <div className="flex items-center gap-2.5">
          <div
            title="Daily Learning Streak"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streakDays}d Streak</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Feature Tabs Bar for Desktop */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-fadeIn">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Active Subject:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SUBJECT_OPTIONS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg text-left font-medium border ${
                    activeSubject === sub
                      ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              12 Core Features:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left font-medium border ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
