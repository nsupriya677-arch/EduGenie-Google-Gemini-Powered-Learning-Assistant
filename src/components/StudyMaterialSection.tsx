import React, { useState } from 'react';
import { Search, FileSearch, Sparkles, Copy, Check, MessageSquare } from 'lucide-react';

const SAMPLE_DOCS = [
  {
    title: 'Biology: CRISPR Cas9 Gene Editing Excerpt',
    text: `CRISPR-Cas9 is an adaptive immune defense mechanism found naturally in bacteria that has been engineered into a revolutionary gene-editing technology. It comprises two key components: the Cas9 endonuclease enzyme, which acts as molecular scissors to cut double-stranded DNA, and a synthetic single guide RNA (sgRNA) that directs Cas9 to a precise genomic locus complementary to a 20-nucleotide spacer sequence. Adjacent to the target site must be a Protospacer Adjacent Motif (PAM) sequence, typically 5'-NGG-3' for Streptococcus pyogenes Cas9. Once the double-strand break (DSB) is introduced, the cell repairs the lesion via either Non-Homologous End Joining (NHEJ), which frequently introduces indel mutations that disrupt gene function, or Homology-Directed Repair (HDR), which enables precise gene insertion in the presence of a repair donor template.`,
    defaultQuery: 'What is the role of the PAM sequence in CRISPR-Cas9?',
  },
  {
    title: 'Physics: Special Relativity Postulates',
    text: `Albert Einstein's 1905 theory of Special Relativity is founded upon two fundamental postulates. The first postulate, the Principle of Relativity, asserts that the laws of physics are invariant across all inertial frames of reference; there exists no preferred or absolute frame of reference at rest. The second postulate, the Invariance of the Speed of Light, states that the speed of light in a vacuum, denoted c, is constant (approximately 299,792,458 m/s) for all observers, regardless of the relative motion of the light source or the observer. These two postulates necessitate revolutionary consequences: time dilation, where moving clocks tick slower relative to a stationary observer, and length contraction, where moving objects appear foreshortened along the direction of motion.`,
    defaultQuery: 'What are the two foundational postulates of special relativity?',
  },
];

export const StudyMaterialSection: React.FC = () => {
  const [material, setMaterial] = useState(SAMPLE_DOCS[0].text);
  const [query, setQuery] = useState(SAMPLE_DOCS[0].defaultQuery);
  const [mode, setMode] = useState<'qa' | 'key_terms' | 'true_false'>('qa');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (customMaterial?: string, customQuery?: string) => {
    const mat = (customMaterial || material).trim();
    if (!mat || loading) return;

    setLoading(true);
    setAnalysis('Analyzing document content and extracting targeted findings...');

    try {
      const res = await fetch('/api/material-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: mat,
          query: customQuery || query,
          mode,
        }),
      });

      const data = await res.json();
      setAnalysis(data.analysis || data.error || 'Failed to analyze material.');
    } catch (err: any) {
      setAnalysis(`⚠️ Error: ${err.message || 'Unable to analyze study material.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = (doc: typeof SAMPLE_DOCS[0]) => {
    setMaterial(doc.text);
    setQuery(doc.defaultQuery);
    handleAnalyze(doc.text, doc.defaultQuery);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">8. 📄 Study Material Analysis</h2>
            <p className="text-xs text-slate-500">Paste textbooks or research papers and query questions grounded strictly in the text</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100/70 text-violet-800">
          Source-Grounded QA
        </span>
      </div>

      {/* Preset docs */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Load sample textbook excerpts:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DOCS.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(doc)}
              className="text-xs bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-800 border border-slate-200 hover:border-violet-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Material */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Source Study Material / Document Excerpt</label>
        <textarea
          rows={5}
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Paste textbook passages, syllabus notes, or research excerpts here..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 font-sans"
        />
      </div>

      {/* Mode & Query */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Analysis Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
          >
            <option value="qa">Ask Specific Question (Strict Grounding)</option>
            <option value="key_terms">Extract Technical Glossary & Definitions</option>
            <option value="true_false">Generate 4 True/False with Quote Citations</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {mode === 'qa' ? 'Question to Ask on this Material' : 'Custom Instruction (Optional)'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder={mode === 'qa' ? 'e.g. What does the author conclude about...?' : 'Specific focus...'}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !material.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm shrink-0"
            >
              {loading ? (
                <span>Analyzing...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      {analysis && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-violet-800 bg-violet-100/70 px-2.5 py-1 rounded-md uppercase">
              Grounded Finding ({mode})
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {analysis}
          </div>
        </div>
      )}
    </section>
  );
};
