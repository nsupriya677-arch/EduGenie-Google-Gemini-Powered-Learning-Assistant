import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SummarizeSectionProps {
  standalone?: boolean;
}

export const SummarizeSection: React.FC<SummarizeSectionProps> = ({ standalone = false }) => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePassages = [
    {
      label: 'Cellular Respiration',
      snippet:
        'Cellular respiration is a series of chemical reactions that break down glucose to produce ATP, which may be used as energy to power many reactions throughout the body. There are three main stages of cellular respiration: glycolysis, the citric acid cycle (Krebs cycle), and electron transport chain / oxidative phosphorylation. Glycolysis takes place in the cytosol, while the other two stages occur within the mitochondria. Aerobic respiration produces around 30 to 32 ATP molecules per glucose molecule.',
    },
    {
      label: 'Industrial Revolution',
      snippet:
        'The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1820–1840. This transition included going from hand production methods to machines; new chemical manufacturing and iron production processes; the increasing use of steam power and water power; the development of machine tools; and the rise of the mechanized factory system. It fundamentally altered social structures, urban growth, and global trade.',
    },
  ];

  const handleSummarize = async (textToUse?: string) => {
    const content = (textToUse ?? text).trim();
    if (!content) return;
    if (textToUse) setText(textToUse);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to summarize text');
      }
      setSummary(data.summary || 'No summary generated.');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setSummary(`⚠️ Error in Summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`w-full ${standalone ? 'max-w-3xl mx-auto py-8' : 'mb-12'}`}>
      <h2 className="text-center text-lg sm:text-xl font-bold text-slate-900 mb-4 tracking-tight">
        Summarize a Paragraph:
      </h2>

      {/* Suggested prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Sample passages:</span>
        {samplePassages.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSummarize(sp.snippet)}
            className="hover:text-blue-600 hover:underline transition-colors text-slate-600 cursor-pointer"
          >
            "{sp.label}"
            {idx < samplePassages.length - 1 && <span className="ml-2 text-slate-300" aria-hidden="true">·</span>}
          </button>
        ))}
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSummarize();
        }}
        className="max-w-xl mx-auto flex flex-col gap-2.5"
      >
        <div className="relative">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste long content to summarize"
            className="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y min-h-[96px]"
          />
          {text && (
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-400 bg-white/90 px-1.5 py-0.5 rounded">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer text-center"
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {(summary || loading || error) && (
        <div className="mt-6 bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 max-w-2xl mx-auto shadow-xs text-left transition-all">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Summary:
            </h3>
            {summary && !loading && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copy summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span>Condensing text into key revision takeaways...</span>
            </div>
          ) : (
            <div className="font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
              {summary}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
