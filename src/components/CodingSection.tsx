import React, { useState } from 'react';
import { Code2, Bug, Zap, HelpCircle, Copy, Check, Terminal, Play } from 'lucide-react';

const SAMPLE_SNIPPETS = [
  {
    title: 'Python: Buggy Binary Search',
    language: 'Python',
    action: 'debug',
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr)  # Bug: off-by-one
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid  # Bug: infinite loop potential
        else:
            high = mid
            
    return -1`,
  },
  {
    title: 'JavaScript: Slow Recursive Fibonacci',
    language: 'JavaScript',
    action: 'optimize',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Current complexity is O(2^n). How can we optimize this to O(n) or O(1) space?`,
  },
  {
    title: 'SQL: N+1 Subquery Optimization',
    language: 'SQL',
    action: 'optimize',
    code: `SELECT u.id, u.name,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
  (SELECT SUM(total) FROM orders o WHERE o.user_id = u.id) as total_spent
FROM users u
WHERE u.active = true;`,
  },
];

export const CodingSection: React.FC = () => {
  const [language, setLanguage] = useState('Python');
  const [action, setAction] = useState<'explain' | 'debug' | 'optimize' | 'test_cases'>('debug');
  const [code, setCode] = useState(SAMPLE_SNIPPETS[0].code);
  const [question, setQuestion] = useState('Where is the bug and how do I fix it?');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAction = async (customCode?: string, customAction?: any) => {
    const targetCode = (customCode !== undefined ? customCode : code).trim();
    const targetAction = customAction || action;

    if (!targetCode && !question) return;

    setLoading(true);
    setResult('Analyzing code syntax, logic, and complexity...');

    try {
      const res = await fetch('/api/code-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code: targetCode,
          action: targetAction,
          question,
        }),
      });

      const data = await res.json();
      setResult(data.result || data.error || 'Failed to process code.');
    } catch (err: any) {
      setResult(`⚠️ Error: ${err.message || 'Unable to connect to coding assistant.'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_SNIPPETS[0]) => {
    setLanguage(sample.language);
    setAction(sample.action as any);
    setCode(sample.code);
    setQuestion('');
    handleAction(sample.code, sample.action);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">7. 💻 Coding Assistant</h2>
            <p className="text-xs text-slate-500">Explains programming concepts, pinpoints bugs, and optimizes Big-O time and space complexity</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-100/70 text-cyan-800">
          Algorithms & Debugging
        </span>
      </div>

      {/* Preset exercises */}
      <div className="mb-4">
        <span className="text-xs text-slate-500 block mb-2">Try common coding challenges:</span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SNIPPETS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(s)}
              className="text-xs bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 hover:border-cyan-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Language & Action selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
          >
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="SQL">SQL</option>
            <option value="Go">Go</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Assistance Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'explain', label: 'Explain', icon: HelpCircle },
              { id: 'debug', label: 'Fix Bugs', icon: Bug },
              { id: 'optimize', label: 'Optimize', icon: Zap },
              { id: 'test_cases', label: 'Tests', icon: Terminal },
            ].map((m) => {
              const Icon = m.icon;
              const active = action === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setAction(m.id as any)}
                  className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                    active
                      ? 'bg-cyan-600 border-cyan-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-cyan-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Source Code</label>
        <textarea
          rows={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your ${language} code here...`}
          className="w-full px-4 py-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Optional question (e.g. 'Why does this cause a stack overflow?')"
          className="w-full sm:flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
        />
        <button
          onClick={() => handleAction()}
          disabled={loading || !code.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Analyzing...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Assistant</span>
            </>
          )}
        </button>
      </div>

      {/* Output */}
      {result && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-md uppercase">
              {language} • {action.toUpperCase()}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
            {result}
          </div>
        </div>
      )}
    </section>
  );
};
