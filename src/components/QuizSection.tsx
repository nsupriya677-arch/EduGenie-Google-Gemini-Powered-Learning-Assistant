import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, SubjectCategory } from '../types';
import { saveQuizResult } from '../utils/progressStore';

interface Props {
  activeSubject: SubjectCategory;
  onProgressUpdated?: () => void;
}

const PRESET_TOPICS: Record<SubjectCategory, string[]> = {
  'Mathematics': ['Pythagoras theorem', 'Quadratic Equations', 'Basic Trigonometry'],
  'Computer Science': ['Binary Search Algorithm', 'Object-Oriented Programming Principles', 'SQL Joins & Keys'],
  'Science': ['Solar System & Planetary Orbits', 'Photosynthesis & Light Reactions', 'Atomic Structure & Periodic Trends'],
  'Commerce': ['Supply & Demand Elasticity', 'Double Entry Accounting', 'Inflation & Central Banks'],
  'Humanities': ['Ancient Mesopotamian Civilizations', 'The Renaissance Period', 'World War II Turning Points'],
  'General': ['Solar System', 'Pythagoras theorem', 'World Geography & Oceans'],
};

export const QuizSection: React.FC<Props> = ({ activeSubject, onProgressUpdated }) => {
  const [topic, setTopic] = useState('Pythagoras theorem');
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { isCorrect: boolean; message: string }>>({});
  const [loading, setLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [scoreSummary, setScoreSummary] = useState<{ correct: number; total: number; percent: number } | null>(null);

  const presets = PRESET_TOPICS[activeSubject] || PRESET_TOPICS['General'];

  const handleGenerate = async (topicToUse?: string) => {
    const t = (topicToUse || topic).trim();
    if (!t || loading) return;
    if (topicToUse) setTopic(topicToUse);

    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setFeedback({});
    setQuizFinished(false);
    setScoreSummary(null);

    try {
      // First try extended quiz endpoint
      const res = await fetch('/api/quiz-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          subject: activeSubject,
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0 && !data.quiz[0].error) {
        setQuestions(data.quiz);
      } else {
        // Fallback to legacy endpoint
        const fbRes = await fetch('/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: t }),
        });
        const fbData = await fbRes.json();
        setQuestions(fbData.quiz || []);
      }
    } catch (err: any) {
      setQuestions([
        {
          question: 'Error generating quiz',
          options: [],
          answer: '',
          error: err.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (feedback[qIdx]) return; // locked once checked
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const checkSingleAnswer = (qIdx: number, correctAnswer: string, explanation?: string) => {
    const selected = selectedAnswers[qIdx];
    if (!selected) {
      setFeedback((prev) => ({
        ...prev,
        [qIdx]: {
          isCorrect: false,
          message: '⚠️ Please select an option first.',
        },
      }));
      return;
    }

    const isCorrect = selected.trim() === correctAnswer.trim();
    const explanationText = explanation ? ` • ${explanation}` : '';

    setFeedback((prev) => ({
      ...prev,
      [qIdx]: {
        isCorrect,
        message: isCorrect
          ? `✅ Correct!${explanationText}`
          : `❌ Incorrect. Correct answer: ${correctAnswer}${explanationText}`,
      },
    }));

    // Check if all answered to finalize score
    const updatedFeedback = {
      ...feedback,
      [qIdx]: { isCorrect, message: '' },
    };

    const answeredCount = Object.keys(updatedFeedback).length;
    if (answeredCount === questions.length) {
      finalizeQuiz(updatedFeedback);
    }
  };

  const finalizeQuiz = (completedFeedback: Record<number, { isCorrect: boolean; message: string }>) => {
    let correctCount = 0;
    const wrongList: string[] = [];

    questions.forEach((q, idx) => {
      if (completedFeedback[idx]?.isCorrect) {
        correctCount++;
      } else {
        wrongList.push(`${topic}: ${q.question.slice(0, 45)}...`);
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScoreSummary({ correct: correctCount, total: questions.length, percent });
    setQuizFinished(true);

    if (percent >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    // Save to student progress store
    saveQuizResult(topic, activeSubject, questions.length, correctCount, wrongList);
    if (onProgressUpdated) onProgressUpdated();
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setFeedback({});
    setQuizFinished(false);
    setScoreSummary(null);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">4. ❓ Quiz Generator</h2>
            <p className="text-xs text-slate-500">Creates multiple-choice tests with plausible distractors, instant grading, and answer rationales</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-800">
          Interactive Assessment
        </span>
      </div>

      {/* Preset topic pills */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick test topics:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(preset)}
              className="text-xs bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Topic or Passage</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Pythagoras theorem, Solar System, Data Structures..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Questions</label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={8}>8 Questions</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          >
            <option value="beginner">Beginner</option>
            <option value="medium">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? <span>Generating MCQs...</span> : <span>Generate Quiz</span>}
        </button>
      </div>

      {/* Quiz Questions List */}
      {questions.length > 0 && (
        <div className="mt-5 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quiz: <span className="text-amber-700 font-semibold">{topic}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer each question and click &quot;Check Answer&quot; for instant evaluation
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>

          {/* Score banner if finished */}
          {scoreSummary && (
            <div className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
              scoreSummary.percent >= 70
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${scoreSummary.percent >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {scoreSummary.percent >= 70 ? <Trophy className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {scoreSummary.percent >= 70 ? 'Outstanding Performance!' : 'Good Effort!'}
                  </h4>
                  <p className="text-xs opacity-90">
                    You scored {scoreSummary.correct} out of {scoreSummary.total} ({scoreSummary.percent}% accuracy). Recorded in your Progress History!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black">{scoreSummary.percent}%</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {questions.map((q, idx) => {
              if (q.error) {
                return (
                  <div key={idx} className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    {q.error}
                  </div>
                );
              }

              const isChecked = Boolean(feedback[idx]);
              const qFeedback = feedback[idx];

              return (
                <div key={idx} className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    <span className="text-amber-700 mr-1.5 font-bold">Q{idx + 1}.</span>
                    {q.question}
                  </p>

                  <div className="space-y-2 mb-3.5">
                    {q.options?.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[idx] === opt;
                      const isCorrectAnswer = opt.trim() === q.answer.trim();

                      let optionStyle = 'border-slate-200 hover:border-amber-300 hover:bg-slate-50';
                      if (isSelected) {
                        optionStyle = 'border-amber-500 bg-amber-50/50 font-medium text-amber-950';
                      }
                      if (isChecked) {
                        if (isCorrectAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium';
                        } else if (isSelected && !isCorrectAnswer) {
                          optionStyle = 'border-red-400 bg-red-50/60 text-red-950';
                        }
                      }

                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(idx, opt)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition ${optionStyle}`}
                        >
                          <input
                            type="radio"
                            name={`quiz_q_${idx}`}
                            checked={isSelected}
                            disabled={isChecked}
                            onChange={() => handleSelectOption(idx, opt)}
                            className="accent-amber-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="flex-1">{opt}</span>
                          {isChecked && isCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isChecked && isSelected && !isCorrectAnswer && (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => checkSingleAnswer(idx, q.answer, q.explanation)}
                      disabled={isChecked}
                      className="self-start px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      {isChecked ? 'Evaluated' : 'Check Answer'}
                    </button>

                    {qFeedback && (
                      <div className={`text-xs font-medium ${
                        qFeedback.isCorrect ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {qFeedback.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
