import React, { useState } from 'react';
import { BookOpen, Sparkles, Download, Copy, Check, Volume2, VolumeX, FileText } from 'lucide-react';
import { SubjectCategory } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface Props {
  activeSubject: SubjectCategory;
}

const PRESET_TOPICS: Record<SubjectCategory, string[]> = {
  'Computer Science': ['OS Deadlocks & Bankers Algorithm', 'Binary Search Trees & Balancing', 'TCP/IP vs OSI Model'],
  'Mathematics': ['Integration by Parts & Substitution', 'Matrices & Determinants', 'Normal Distribution & Z-Scores'],
  'Science': ['Cellular Respiration & Glycolysis', 'Electromagnetic Spectrum', 'Periodic Table Periodic Trends'],
  'Commerce': ['Double-Entry Bookkeeping Principles', 'Monopoly vs Perfect Competition', 'Balance Sheet Analysis'],
  'Humanities': ['Causes of World War I', 'Cognitive Biases in Decision Making', 'Literary Devices & Rhetoric'],
  'General': ['Photosynthesis Mechanisms', 'Plate Tectonics & Continental Drift', 'The Scientific Method'],
};

export const SmartNotesSection: React.FC<Props> = ({ activeSubject }) => {
  const [topic, setTopic] = useState('Operating System Deadlocks');
  const [format, setFormat] = useState('cornell');
  const [depth, setDepth] = useState('comprehensive');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const presets = PRESET_TOPICS[activeSubject] || PRESET_TOPICS['General'];

  const handleGenerate = async (topicToUse?: string) => {
    const targetTopic = (topicToUse || topic).trim();
    if (!targetTopic || loading) return;
    if (topicToUse) setTopic(topicToUse);

    setLoading(true);
    setNotes('Structuring smart revision notes...');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/smart-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          subject: activeSubject,
          format,
          depth,
        }),
      });
      const data = await res.json();
      setNotes(data.notes || data.error || 'Failed to generate notes.');
    } catch (err: any) {
      setNotes(`⚠️ Error: ${err.message || 'Unable to generate notes.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notes) return;
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const started = speakText(notes, () => setIsSpeaking(false));
      setIsSpeaking(started);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">2. 📚 Smart Notes Generator</h2>
            <p className="text-xs text-slate-500">Automatically builds structured revision notes with formulas, mnemonics, and self-tests</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
          Structured Study
        </span>
      </div>

      {/* Preset suggestions */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Recommended topics for {activeSubject}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(preset)}
              className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Topic / Chapter</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Newton's Laws of Motion, Enzymes, Keynesian Economics..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes Style</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          >
            <option value="cornell">Cornell Study System</option>
            <option value="outline">Mind-Map Hierarchy</option>
            <option value="high-yield">High-Yield Exam Cram Sheet</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Generating Notes...</span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Generate Smart Notes</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Notes Display */}
      {notes && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-md uppercase">
                {topic}
              </span>
              <span className="text-xs text-slate-500 font-medium">({format} style)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                title={isSpeaking ? 'Stop audio' : 'Listen to notes'}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {notes}
          </div>
        </div>
      )}
    </section>
  );
};
