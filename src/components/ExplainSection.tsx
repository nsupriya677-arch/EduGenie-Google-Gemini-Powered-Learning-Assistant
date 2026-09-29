import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ExplainSectionProps {
  standalone?: boolean;
}

export const ExplainSection: React.FC<ExplainSectionProps> = ({ standalone = false }) => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTopics = [
    'Photosynthesis',
    'quantum computing',
    'Binary Search Algorithm',
    'Black holes',
    'Plate Tectonics',
  ];

  const handleExplain = async (topicToUse?: string) => {
    const t = (topicToUse ?? topic).trim();
    if (!t) return;
    if (topicToUse) setTopic(topicToUse);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate explanation');
      }
      setExplanation(data.explanation || 'No explanation generated.');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setExplanation(`⚠️ Error in Explanation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`w-full ${standalone ? 'max-w-3xl mx-auto py-8' : 'mb-12'}`}>
      <h2 className="text-center text-lg sm:text-xl font-bold text-slate-900 mb-4 tracking-tight">
        Need an Explanation?
      </h2>

      {/* Suggested prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Sample topics:</span>
        {sampleTopics.map((st, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleExplain(st)}
            className="hover:text-blue-600 hover:underline transition-colors text-slate-600 cursor-pointer"
          >
            "{st}"
            {idx < sampleTopics.length - 1 && <span className="ml-2 text-slate-300" aria-hidden="true">·</span>}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExplain();
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 max-w-xl mx-auto"
      >
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Photosynthesis"
          className="flex-1 px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer text-center"
        >
          {loading ? 'Explaining...' : 'Explain'}
        </button>
      </form>

      {/* Result Card */}
      {(explanation || loading || error) && (
        <div className="mt-6 bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 max-w-2xl mx-auto shadow-xs text-left transition-all">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Explanation:
            </h3>
            {explanation && !loading && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copy explanation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span>Crafting simple, student-friendly explanation...</span>
            </div>
          ) : (
            <div className="font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
              {explanation}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
