/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
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
  CheckCircle2,
  Play,
} from 'lucide-react';
import { FeatureTabId, SubjectCategory } from './types';
import { Header, NAV_ITEMS } from './components/Header';
import { AssistantSection } from './components/AssistantSection';
import { SmartNotesSection } from './components/SmartNotesSection';
import { SummarizerSection } from './components/SummarizerSection';
import { QuizSection } from './components/QuizSection';
import { ExamPrepSection } from './components/ExamPrepSection';
import { StudyPlannerSection } from './components/StudyPlannerSection';
import { CodingSection } from './components/CodingSection';
import { StudyMaterialSection } from './components/StudyMaterialSection';
import { PersonalizedLearningSection } from './components/PersonalizedLearningSection';
import { ProgressSection } from './components/ProgressSection';
import { MultiSubjectSection } from './components/MultiSubjectSection';
import { ExplainSection } from './components/ExplainSection';
import { LearningPathSection } from './components/LearningPathSection';
import { getStudentProgress } from './utils/progressStore';

export default function App() {
  const [activeTab, setActiveTab] = useState<FeatureTabId>('all');
  const [activeSubject, setActiveSubject] = useState<SubjectCategory>('Computer Science');
  const [progressKey, setProgressKey] = useState(0);
  const [streakDays, setStreakDays] = useState(3);
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'offline'>('checking');

  useEffect(() => {
    const p = getStudentProgress();
    setStreakDays(p.streakDays);

    fetch('/api/health')
      .then((res) => (res.ok ? setBackendHealth('healthy') : setBackendHealth('offline')))
      .catch(() => setBackendHealth('offline'));
  }, [progressKey]);

  const handleProgressUpdated = () => {
    setProgressKey((prev) => prev + 1);
  };

  const handleLaunchTopic = (
    topic: string,
    sub: SubjectCategory,
    tool: 'notes' | 'quiz' | 'exam' | 'assistant'
  ) => {
    setActiveSubject(sub);
    setActiveTab(tool);
    // Smooth scroll to top of section
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header with Global Subject Switcher & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        streakDays={streakDays}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white rounded-2xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full-Stack AI Education Suite • 12 Core Capabilities</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              Welcome to EduGenie 🧠✨
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
              Your personalized AI academic tutor for question answering, structured notes, instant quiz generation, exam preparation, coding assistance, and progress tracking across all subjects.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={() => setActiveTab('assistant')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-50 transition shadow-sm cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask EduGenie</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/30 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take a Quiz</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/30 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm rounded-xl font-semibold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <span>Full Canvas View</span>
              </button>
            </div>
          </div>
        </section>

        {/* 12 Features Quick Selector Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Explore All 12 Educational Modules:
            </h2>
            <span className="text-2xs text-slate-400">Current Subject: <strong className="text-slate-700">{activeSubject}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{item.number}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">{item.label}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Feature Render View: Single Tool OR Full 12-Feature Canvas */}
        <div className="space-y-8">
          {/* 1. AI Learning Assistant */}
          {(activeTab === 'assistant' || activeTab === 'all') && (
            <div id="module-assistant">
              <AssistantSection activeSubject={activeSubject} />
            </div>
          )}

          {/* 2. Smart Notes Generator */}
          {(activeTab === 'notes' || activeTab === 'all') && (
            <div id="module-notes">
              <SmartNotesSection activeSubject={activeSubject} />
            </div>
          )}

          {/* 3. AI Summarizer */}
          {(activeTab === 'summarizer' || activeTab === 'all') && (
            <div id="module-summarizer">
              <SummarizerSection />
            </div>
          )}

          {/* 4. Quiz Generator */}
          {(activeTab === 'quiz' || activeTab === 'all') && (
            <div id="module-quiz">
              <QuizSection
                activeSubject={activeSubject}
                onProgressUpdated={handleProgressUpdated}
              />
            </div>
          )}

          {/* 5. Exam Preparation */}
          {(activeTab === 'exam' || activeTab === 'all') && (
            <div id="module-exam">
              <ExamPrepSection activeSubject={activeSubject} />
            </div>
          )}

          {/* 6. Personalized Study Planner */}
          {(activeTab === 'planner' || activeTab === 'all') && (
            <div id="module-planner">
              <StudyPlannerSection activeSubject={activeSubject} />
            </div>
          )}

          {/* 7. Coding Assistant */}
          {(activeTab === 'coding' || activeTab === 'all') && (
            <div id="module-coding">
              <CodingSection />
            </div>
          )}

          {/* 8. Study Material Analysis */}
          {(activeTab === 'material' || activeTab === 'all') && (
            <div id="module-material">
              <StudyMaterialSection />
            </div>
          )}

          {/* 9. Personalized Learning */}
          {(activeTab === 'personalized' || activeTab === 'all') && (
            <div id="module-personalized">
              <PersonalizedLearningSection activeSubject={activeSubject} />
            </div>
          )}

          {/* 10. Quiz Score & Progress */}
          {(activeTab === 'progress' || activeTab === 'all') && (
            <div id="module-progress">
              <ProgressSection
                onDrillTopic={(topic, sub) => handleLaunchTopic(topic, sub, 'quiz')}
              />
            </div>
          )}

          {/* 11. Multi-Subject Support Hub */}
          {(activeTab === 'subjects' || activeTab === 'all') && (
            <div id="module-subjects">
              <MultiSubjectSection
                activeSubject={activeSubject}
                onSelectSubject={(sub) => setActiveSubject(sub)}
                onLaunchTopic={handleLaunchTopic}
              />
            </div>
          )}

          {/* Milestone 2 Legacy Compatibility Sections */}
          {activeTab === 'all' && (
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Milestone 2 & 3 Core Modules (LaMini-Flan-T5 & Roadmap Engine)
                </h3>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                  <ExplainSection />
                </div>
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
                  <LearningPathSection />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">EduGenie AI</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>
                Backend:{' '}
                {backendHealth === 'healthy' ? 'Online (Gemini Pro & Flash)' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div>All 12 educational modules active • Fully responsive for mobile, tablet & desktop</div>
        </div>
      </footer>
    </div>
  );
}
