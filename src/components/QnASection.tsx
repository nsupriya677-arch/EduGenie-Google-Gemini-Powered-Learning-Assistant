import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface QnASectionProps {
  standalone?: boolean;
}

export const QnASection: React.FC<QnASectionProps> = ({ standalone = false }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    'Why is the sky blue?',
    'which is the largest ocean?',
    'How do plants generate oxygen during photosynthesis?',
    'What causes ocean tides?',
  ];

  const handleGetAnswer = async (qToAsk?: string) => {
    const q = (qToAsk ?? question).trim();
    if (!q) return;
    if (qToAsk) setQuestion(qToAsk);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/qa?question=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve answer');
      }
      setAnswer(data.answer || 'No answer received.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setAnswer(`⚠️ Error in QnA: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`w-full ${standalone ? 'max-w-3xl mx-auto py-8' : 'mb-12'}`}>
      <h2 className="text-center text-lg sm:text-xl font-bold text-slate-900 mb-4 tracking-tight">
        Ask EduGenie a Question:
      </h2>

      {/* Suggested prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Sample questions:</span>
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleGetAnswer(sq)}
            className="hover:text-blue-600 hover:underline transition-colors text-slate-600 cursor-pointer"
          >
            "{sq}"
            {idx < sampleQuestions.length - 1 && <span className="ml-2 text-slate-300" aria-hidden="true">·</span>}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGetAnswer();
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 max-w-xl mx-auto"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Why is the sky blue?"
          className="flex-1 px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer text-center"
        >
          {loading ? 'Thinking...' : 'Get Answer'}
        </button>
      </form>

      {/* Result Card */}
      {(answer || loading || error) && (
        <div className="mt-6 bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 max-w-2xl mx-auto shadow-xs text-left transition-all">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Answer:
            </h3>
            {answer && !loading && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copy answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span>EduGenie is consulting knowledge base...</span>
            </div>
          ) : (
            <div className="font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
              {answer}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
