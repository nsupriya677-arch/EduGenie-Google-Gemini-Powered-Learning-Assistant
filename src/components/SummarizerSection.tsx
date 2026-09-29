import React, { useState } from 'react';
import { FileEdit, Sparkles, Copy, Check, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

const SAMPLE_PASSAGES = [
  {
    title: 'Biology: Cellular Respiration',
    text: `Cellular respiration is a series of chemical reactions that break down glucose to produce ATP, which may be used as energy to power many reactions throughout the body. There are three main stages of cellular respiration: glycolysis, the citric acid cycle (Krebs cycle), and the electron transport chain. Glycolysis takes place in the cytosol of the cell and does not require oxygen (anaerobic). In contrast, the citric acid cycle and electron transport chain occur within the mitochondria and require oxygen (aerobic). Aerobic cellular respiration produces approximately 30 to 32 ATP molecules per glucose molecule, rendering it significantly more efficient than anaerobic fermentation.`,
  },
  {
    title: 'Computer Science: Operating Systems & Virtual Memory',
    text: `Virtual memory is a memory management capability of an operating system that uses hardware and software to allow a computer to compensate for physical memory shortages by temporarily transferring data from random access memory (RAM) to disk storage. Mapping chunks of memory to disk files enables a computer to treat secondary storage as though it were main memory. Most implementations use paging, where memory addresses are divided into fixed-size blocks called pages. When a process references a page not present in physical RAM, a page fault occurs, causing the operating system to swap the required page into memory.`,
  },
  {
    title: 'Economics: Supply, Demand & Market Equilibrium',
    text: `The law of supply and demand describes how prices vary as a result of a balance between product availability and demand. The law of demand states that, ceteris paribus, as the price of a good increases, the quantity demanded decreases. Conversely, the law of supply posits that an increase in price results in an increase in quantity supplied. Market equilibrium occurs at the intersection of the supply and demand curves, where the quantity demanded equals the quantity supplied. Any exogenous shock, such as technological innovation or changes in consumer preferences, shifts the curves and establishes a new equilibrium price and quantity.`,
  },
];

export const SummarizerSection: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_PASSAGES[0].text);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const reductionPercent = inputWordCount > 0 && outputWordCount > 0
    ? Math.max(0, Math.round(((inputWordCount - outputWordCount) / inputWordCount) * 100))
    : 0;

  const handleSummarize = async (textToUse?: string) => {
    const text = (textToUse || inputText).trim();
    if (!text || loading) return;
    if (textToUse) setInputText(textToUse);

    setLoading(true);
    setSummary('Summarizing study material...');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSummary(data.summary || data.error || 'Failed to summarize.');
    } catch (err: any) {
      setSummary(`⚠️ Error: ${err.message || 'Unable to connect to AI summarizer.'}`);
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

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const started = speakText(summary, () => setIsSpeaking(false));
      setIsSpeaking(started);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">3. 📝 AI Summarizer</h2>
            <p className="text-xs text-slate-500">Converts dense reading material into clear, high-yield bulleted summaries for quick revision</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          Fast Revision
        </span>
      </div>

      {/* Preset Passages */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Load sample textbook passages:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PASSAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample.text);
                handleSummarize(sample.text);
              }}
              className="text-xs bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-600">Study Material / Paragraph</label>
          <span className="text-xs text-slate-400">{inputWordCount} words</span>
        </div>
        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste articles, lecture transcripts, or textbook chapters here..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleSummarize()}
          disabled={loading || !inputText.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Summarizing...</span>
          ) : (
            <>
              <span>Summarize Content</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Summary Output */}
      {summary && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase">
                Summary
              </span>
              {reductionPercent > 0 && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {reductionPercent}% condensed ({inputWordCount} → {outputWordCount} words)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                title={isSpeaking ? 'Stop audio' : 'Listen'}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {summary}
          </div>
        </div>
      )}
    </section>
  );
};
