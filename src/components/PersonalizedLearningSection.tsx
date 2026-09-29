import React, { useState } from 'react';
import { Target, Sparkles, Copy, Check, Volume2, VolumeX, Lightbulb, Compass } from 'lucide-react';
import { SubjectCategory } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface Props {
  activeSubject: SubjectCategory;
}

const PRESET_TOPICS: Record<SubjectCategory, string[]> = {
  'Computer Science': ['Quantum Computing & Qubits', 'Public Key Cryptography (RSA)', 'Machine Learning Gradient Descent'],
  'Mathematics': ['Eigenvalues & Matrix Transformations', 'Taylor Series Approximations', 'Topology & The Mobius Strip'],
  'Science': ['Schrödinger Cat & Superposition', 'Thermodynamics Entropy', 'Mitochondrial ATP Synthesis'],
  'Commerce': ['Derivatives & Hedging Strategies', 'Macroeconomic Liquidity Traps', 'Behavioral Economics Nudges'],
  'Humanities': ['Existentialism vs Absurdism', 'Linguistic Relativism (Sapir-Whorf)', 'Post-Modern Historiography'],
  'General': ['Quantum Computing', 'Black Holes & Event Horizons', 'How Neural Networks Think'],
};

export const PersonalizedLearningSection: React.FC<Props> = ({ activeSubject }) => {
  const [topic, setTopic] = useState('Quantum Computing & Qubits');
  const [educationLevel, setEducationLevel] = useState('High School');
  const [learningStyle, setLearningStyle] = useState('Real-world Analogies');
  const [currentUnderstanding, setCurrentUnderstanding] = useState('Beginner');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const presets = PRESET_TOPICS[activeSubject] || PRESET_TOPICS['General'];

  const handleGenerate = async (topicToUse?: string) => {
    const t = (topicToUse || topic).trim();
    if (!t || loading) return;
    if (topicToUse) setTopic(topicToUse);

    setLoading(true);
    setExplanation('Calibrating lesson to your educational level and cognitive learning style...');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/personalized-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          subject: activeSubject,
          educationLevel,
          learningStyle,
          currentUnderstanding,
        }),
      });

      const data = await res.json();
      setExplanation(data.explanation || data.error || 'Failed to personalize lesson.');
    } catch (err: any) {
      setExplanation(`⚠️ Error: ${err.message || 'Unable to adapt lesson.'}`);
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

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const started = speakText(explanation, () => setIsSpeaking(false));
      setIsSpeaking(started);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-fuchsia-50 text-fuchsia-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">9. 🎯 Personalized Learning</h2>
            <p className="text-xs text-slate-500">Adapts explanations to the student&apos;s exact grade level, prior knowledge, and preferred cognitive style</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-100/70 text-fuchsia-800">
          Adaptive Instruction
        </span>
      </div>

      {/* Suggested Topics */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
          <span>Popular topics to customize:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(preset)}
              className="text-xs bg-slate-50 hover:bg-fuchsia-50 text-slate-700 hover:text-fuchsia-800 border border-slate-200 hover:border-fuchsia-200 rounded-lg px-2.5 py-1.5 transition text-left cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Topic input */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Concept or Topic to Learn</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="e.g. Quantum Computing, Photosynthesis, Derivatives..."
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
        />
      </div>

      {/* Student Profile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Student Education Level</label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
          >
            <option value="Elementary (Grade 3-5)">Elementary School (Grade 3-5)</option>
            <option value="Middle School (Grade 6-8)">Middle School (Grade 6-8)</option>
            <option value="High School">High School (Grade 9-12)</option>
            <option value="Undergraduate / College">Undergraduate / College</option>
            <option value="Graduate / Professional">Graduate / Professional</option>
            <option value="Absolute Beginner">Absolute Beginner (No prior math/tech background)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Learning Style</label>
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
          >
            <option value="Real-world Analogies">Real-world Everyday Analogies</option>
            <option value="Step-by-Step Formal Logic">Step-by-Step Formal Logic & Proofs</option>
            <option value="Visual & Diagrammatic Descriptions">Visual & Diagrammatic Mind-Maps</option>
            <option value="Socratic Questioning & Inquiry">Interactive Socratic Questioning</option>
            <option value="Story-Driven & Historical Context">Story-Driven / Historical Origin</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Prior Knowledge</label>
          <select
            value={currentUnderstanding}
            onChange={(e) => setCurrentUnderstanding(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
          >
            <option value="Zero Knowledge">Zero Knowledge (Brand New)</option>
            <option value="Beginner">Beginner (Heard terms before)</option>
            <option value="Intermediate">Intermediate (Know basics, need intuition)</option>
            <option value="Advanced">Advanced (Want deep edge cases)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !topic.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>Personalizing Lesson...</span>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Generate Tailored Lesson</span>
            </>
          )}
        </button>
      </div>

      {/* Output */}
      {explanation && (
        <div className="mt-4 p-5 sm:p-6 bg-slate-50/90 rounded-xl border border-slate-200 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-fuchsia-800 bg-fuchsia-100/70 px-2.5 py-1 rounded-md uppercase">
                {educationLevel} • {learningStyle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                title={isSpeaking ? 'Stop audio' : 'Listen'}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-fuchsia-600" /> : <Volume2 className="w-3.5 h-3.5" />}
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
          <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {explanation}
          </div>
        </div>
      )}
    </section>
  );
};
