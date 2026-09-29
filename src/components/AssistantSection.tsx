import React, { useState } from 'react';
import { Bot, Send, Volume2, VolumeX, Sparkles, Copy, Check } from 'lucide-react';
import { SubjectCategory } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface Props {
  activeSubject: SubjectCategory;
}

const SAMPLE_QUESTIONS: Record<SubjectCategory, string[]> = {
  'Computer Science': [
    'What is the difference between TCP and UDP?',
    'Explain how QuickSort works with a simple example.',
    'What is an Index in SQL and why does it speed up queries?',
  ],
  'Mathematics': [
    'Why is division by zero undefined?',
    'Explain Bayes theorem intuitively with a medical test example.',
    'What is the geometrical meaning of an eigenvalue?',
  ],
  'Science': [
    'Why is the sky blue during the day and red at sunset?',
    'How does ATP release energy inside human cells?',
    'What is the difference between nuclear fission and fusion?',
  ],
  'Commerce': [
    'What is the law of diminishing marginal utility?',
    'Explain the difference between Fiscal Policy and Monetary Policy.',
    'How do interest rates affect inflation?',
  ],
  'Humanities': [
    'What were the primary socio-economic triggers of the French Revolution?',
    'Explain Pavlov classical conditioning vs Skinner operant conditioning.',
    'What is the difference between deductive and inductive reasoning?',
  ],
  'General': [
    'which is the largest ocean?',
    'Why is the sky blue?',
    'How does photosynthesis convert sunlight into glucose?',
  ],
};

export const AssistantSection: React.FC<Props> = ({ activeSubject }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleList = SAMPLE_QUESTIONS[activeSubject] || SAMPLE_QUESTIONS['General'];

  const handleAsk = async (qToAsk?: string) => {
    const q = (qToAsk || question).trim();
    if (!q || loading) return;
    if (qToAsk) setQuestion(qToAsk);

    setLoading(true);
    setAnswer('EduGenie is thinking...');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch(`/qa?question=${encodeURIComponent(q)}`);
      const data = await res.json();
      setAnswer(data.answer || data.error || 'No answer generated.');
    } catch (err: any) {
      setAnswer(`⚠️ Error: ${err.message || 'Failed to reach AI tutor.'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const started = speakText(answer, () => setIsSpeaking(false));
      setIsSpeaking(started);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">1. 🤖 AI Learning Assistant</h2>
            <p className="text-xs text-slate-500">Ask any academic question for clear, accurate, and encouraging tutor explanations</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100/70 text-blue-700">
          {activeSubject}
        </span>
      </div>

      {/* Suggested Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick student prompts:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleList.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(sample)}
              className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={`Ask about ${activeSubject.toLowerCase()} or any concept...`}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          {loading ? (
            <span>Thinking...</span>
          ) : (
            <>
              <span>Get Answer</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {answer && (
        <div className="mt-5 p-5 bg-slate-50/80 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tutor Response</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSpeech}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-blue-600" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {answer}
          </div>
        </div>
      )}
    </section>
  );
};
