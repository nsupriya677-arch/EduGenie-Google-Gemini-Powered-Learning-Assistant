import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Flame, Target, AlertTriangle, ArrowUpRight, RotateCcw } from 'lucide-react';
import { StudentProgress, SubjectCategory } from '../types';
import { getStudentProgress, resetProgress } from '../utils/progressStore';

interface Props {
  onDrillTopic?: (topic: string, subject: SubjectCategory) => void;
}

export const ProgressSection: React.FC<Props> = ({ onDrillTopic }) => {
  const [progress, setProgress] = useState<StudentProgress>(getStudentProgress());

  const refreshProgress = () => {
    setProgress(getStudentProgress());
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your quiz score history?')) {
      const blank = resetProgress();
      setProgress(blank);
    }
  };

  const subjectOrder: SubjectCategory[] = [
    'Mathematics',
    'Computer Science',
    'Science',
    'Commerce',
    'Humanities',
  ];

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">10. 📊 Quiz Score & Progress Tracker</h2>
            <p className="text-xs text-slate-500">Monitors performance, subject mastery, learning streaks, and flags weak areas for targeted drills</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-semibold px-2.5 py-1 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
        >
          Reset Stats
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Quizzes Taken</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{progress.totalQuizzesTaken}</div>
          <div className="text-2xs text-slate-500 mt-0.5">{progress.totalQuestionsAnswered} questions solved</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Overall Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{progress.overallAccuracy}%</div>
          <div className="text-2xs text-emerald-700 font-semibold mt-0.5">
            {progress.totalCorrect} / {Math.max(1, progress.totalQuestionsAnswered)} correct
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{progress.streakDays} Days</div>
          <div className="text-2xs text-orange-600 font-medium mt-0.5">Daily study consistency</div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Flagged Areas</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{progress.weakAreas.length}</div>
          <div className="text-2xs text-rose-600 font-medium mt-0.5">Concepts to practice</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Mastery Radar / Bars */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span>Subject Mastery Breakdown</span>
            <span className="text-2xs font-normal text-slate-500">Based on quiz accuracy</span>
          </h3>
          <div className="space-y-3">
            {subjectOrder.map((sub) => {
              const stat = progress.subjectStats[sub] || { attempts: 0, correct: 0, total: 0 };
              const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={sub}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-800">{sub}</span>
                    <span className="text-slate-500">
                      {stat.total > 0 ? `${acc}% (${stat.correct}/${stat.total})` : 'No quizzes yet'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        acc >= 80 ? 'bg-emerald-500' : acc >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${stat.total > 0 ? Math.max(acc, 5) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Areas Action Center */}
        <div className="p-4 sm:p-5 bg-rose-50/50 rounded-xl border border-rose-200/80">
          <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Weak Areas & Targeted Drills</span>
          </h3>
          {progress.weakAreas.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              🎉 No weak areas flagged! Keep taking quizzes to identify concepts that need reinforcement.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-rose-800 mb-2">
                Click any missed concept below to launch an immediate remediation drill:
              </p>
              {progress.weakAreas.map((weak, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-rose-200 text-xs shadow-2xs hover:border-rose-400 transition"
                >
                  <span className="font-medium text-slate-800 truncate mr-2">{weak}</span>
                  {onDrillTopic && (
                    <button
                      onClick={() => onDrillTopic(weak.split(':')[0] || weak, 'Mathematics')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition cursor-pointer shrink-0"
                    >
                      <span>Drill</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quiz History Table */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
          Recent Quiz Attempts History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Topic</th>
                <th className="py-2.5 px-3 font-semibold">Subject</th>
                <th className="py-2.5 px-3 font-semibold">Score</th>
                <th className="py-2.5 px-3 font-semibold">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progress.history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    No quizzes recorded yet. Take a quiz to start building your streak!
                  </td>
                </tr>
              ) : (
                progress.history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{rec.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{rec.topic}</td>
                    <td className="py-2.5 px-3 text-slate-600">{rec.subject}</td>
                    <td className="py-2.5 px-3 font-semibold">
                      {rec.correctAnswers} / {rec.totalQuestions}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-2xs ${
                          rec.percentage >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.percentage >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
