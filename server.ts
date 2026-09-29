import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper to get GoogleGenAI client
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback helper to handle spikes in demand smoothly
async function generateWithFallback(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}) {
  const ai = getAIClient();
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config: any = {};
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        config.responseSchema = options.responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed or busy, trying fallback...`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All generative models are currently busy. Please try again.');
}

// Clean markdown code blocks function from prompt
function cleanJsonBlock(text: string): string {
  return text.replace(/^```(?:json)?\n([\s\S]*?)```$/m, '$1').trim();
}

// -------------------------------------------------------------
// Activity 2.2 Endpoints Matching EduGenie Specification
// -------------------------------------------------------------

// 1. Q&A Module (GET /qa & POST /qa)
app.get('/qa', async (req: Request, res: Response) => {
  const question = (req.query.question as string)?.trim();
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question query parameter.' });
  }

  try {
    const text = await generateWithFallback({
      contents: `You are EduGenie QnA tutor. Answer the student's question accurately, concisely, and with pedagogical clarity:\n\nQuestion: ${question}`,
      systemInstruction:
        'You are an expert educational tutor. Deliver direct, accurate, and encouraging academic answers tailored for student understanding.',
    });

    return res.json({ answer: text.trim() });
  } catch (error: any) {
    console.error('Error in /qa:', error);
    return res.status(500).json({
      error: error.message || 'Error generating Q&A response',
      answer: `⚠️ Error in QnA: ${error.message || 'Unable to connect to AI engine'}`,
    });
  }
});

app.post('/qa', async (req: Request, res: Response) => {
  const question = req.body?.question?.trim();
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question in request body.' });
  }

  try {
    const text = await generateWithFallback({
      contents: `You are EduGenie QnA tutor. Answer the student's question accurately, concisely, and with pedagogical clarity:\n\nQuestion: ${question}`,
      systemInstruction:
        'You are an expert educational tutor. Deliver direct, accurate, and encouraging academic answers tailored for student understanding.',
    });

    return res.json({ answer: text.trim() });
  } catch (error: any) {
    console.error('Error in /qa POST:', error);
    return res.status(500).json({
      error: error.message || 'Error generating Q&A response',
      answer: `⚠️ Error in QnA: ${error.message || 'Unable to connect to AI engine'}`,
    });
  }
});

// 2. Explanation Module (POST /explain & POST /explain/)
const handleExplain = async (req: Request, res: Response) => {
  const topic = req.body?.topic?.trim();
  if (!topic) {
    return res.status(400).json({ error: 'Please provide a topic.' });
  }

  try {
    const prompt = `Explain the concept of '${topic}' in a simple, clear, and engaging way for a school student or beginner.
Focus on clarity and brevity: break down complex ideas into everyday analogies, avoid unnecessary jargon, and keep the tone encouraging and accessible.`;

    const text = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You act as a lightweight, accessible educational explanation companion (like LaMini-Flan-T5). Provide straightforward, bite-sized conceptual breakdowns without technical intimidation.',
    });

    return res.json({ topic, explanation: text.trim() });
  } catch (error: any) {
    console.error('Error in /explain:', error);
    return res.status(500).json({
      error: error.message || 'Error in Explanation',
      topic,
      explanation: `⚠️ Error in Explanation: ${error.message || 'Service unavailable'}`,
    });
  }
};

app.post('/explain', handleExplain);
app.post('/explain/', handleExplain);

// 3. Summarization Module (POST /summarize & POST /summarize/)
const handleSummarize = async (req: Request, res: Response) => {
  const text = req.body?.text?.trim();
  if (!text) {
    return res.status(400).json({ error: 'Please provide text to summarize.' });
  }

  try {
    const prompt = `Summarize the following educational text in simple, clear language.
Retain all essential concepts, formulas, or key dates while eliminating redundancy. Structure the summary with key bullet points or a concise synopsis ideal for quick study and revision:\n\n${text}`;

    const summary = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an educational summarizer. Distill dense study texts into high-yield, crystal-clear summaries for swift revision.',
    });

    return res.json({ summary: summary.trim() });
  } catch (error: any) {
    console.error('Error in /summarize:', error);
    return res.status(500).json({
      error: error.message || 'Error in Summary',
      summary: `⚠️ Error in Summary: ${error.message || 'Service unavailable'}`,
    });
  }
};

app.post('/summarize', handleSummarize);
app.post('/summarize/', handleSummarize);

// 4. Quiz Generation Module (POST /quiz & POST /quiz/)
const handleQuiz = async (req: Request, res: Response) => {
  const text = req.body?.text?.trim();
  if (!text) {
    return res.status(400).json({ error: 'Please provide text for quiz.' });
  }

  try {
    const prompt = `You are a quiz generator.
From the following passage or topic, create exactly 3 multiple-choice questions. Each question must include:
- A "question"
- A list of exactly 4 plausible "options"
- A correct "answer" that must exactly match one of the 4 options.

Passage/Topic:
${text}`;

    const rawOutput = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: 'The multiple choice question',
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Exactly 4 distinct plausible options',
            },
            answer: {
              type: Type.STRING,
              description: 'The correct answer, strictly matching one of the options',
            },
          },
          required: ['question', 'options', 'answer'],
        },
      },
    });

    const cleaned = cleanJsonBlock(rawOutput);
    const quiz = JSON.parse(cleaned);
    return res.json({ quiz });
  } catch (error: any) {
    console.error('Error in /quiz:', error);
    return res.status(500).json({
      quiz: [{ error: `⚠️ Error in Quiz Generation: ${error.message || 'Failed to parse output'}` }],
    });
  }
};

app.post('/quiz', handleQuiz);
app.post('/quiz/', handleQuiz);

// 5. Learning Recommendations Module (GET /learn/recommendations & POST /learn/recommendations)
const handleLearningRecommendations = async (topic: string, res: Response) => {
  try {
    const prompt = `You are an AI educational tutor and curriculum architect. The student wants to master: ${topic}.
Provide a structured, step-by-step adaptive learning path including:
1. Overview & Learning Objectives
2. Level I: Beginner Foundation (Core concepts, estimated duration, step-by-step milestones)
3. Level II: Intermediate Proficiency (Applied projects, practical skills, intermediate concepts)
4. Level III: Advanced Mastery (Deep internals, optimization, production patterns)
5. Curated Resources (Recommended books, interactive platforms, video lectures, and docs)
6. Adaptive Study Tips & Common Pitfalls to Avoid`;

    const recommendation = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are a master curriculum advisor. Deliver inspiring, rigorous, and clearly structured roadmap recommendations.',
    });

    return res.json({ topic, recommendation: recommendation.trim() });
  } catch (error: any) {
    console.error('Error in /learn/recommendations:', error);
    return res.status(500).json({
      topic,
      recommendation: `❌ Error occurred: ${error.message || 'Service unavailable'}`,
    });
  }
};

app.get('/learn/recommendations', async (req: Request, res: Response) => {
  const topic = (req.query.topic as string)?.trim();
  if (!topic) {
    return res.status(400).json({ error: 'Please provide a topic query parameter.' });
  }
  return handleLearningRecommendations(topic, res);
});

app.post('/learn/recommendations', async (req: Request, res: Response) => {
  const topic = req.body?.topic?.trim();
  if (!topic) {
    return res.status(400).json({ error: 'Please provide a topic in request body.' });
  }
  return handleLearningRecommendations(topic, res);
});

// -------------------------------------------------------------
// Extended EduGenie API Endpoints for Full Feature Suite
// -------------------------------------------------------------

// 6. Smart Notes Generator (POST /api/smart-notes)
app.post('/api/smart-notes', async (req: Request, res: Response) => {
  const { topic, subject = 'General', format = 'cornell', depth = 'comprehensive' } = req.body || {};
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Please provide a topic for smart notes.' });
  }

  try {
    const prompt = `You are EduGenie Smart Notes Generator for the subject "${subject}".
Create high-quality, structured academic revision notes on: "${topic}".
Notes format: ${format} style with ${depth} depth.

Generate your response in clear markdown with these exact structured sections:
# 📚 Study Notes: ${topic}
### 🎯 Learning Objectives & Core Synopsis
- 3 clear key objectives of this concept.

### 🧠 Core Principles & Key Concepts
- Deep-dive into foundational mechanics and logic.
- Break down complex mechanisms step by step.

### 📐 Key Definitions & Formulas / Axioms
- Crucial terminology, notation, and equations with units or parameter explanations.

### ⚡ Memory Triggers & Mnemonics
- Clever acronyms, visual metaphors, or mnemonics to memorize tricky aspects.

### ⚠️ Common Traps & Misconceptions
- What mistakes do students frequently make on tests? How to avoid them?

### 📝 3 Quick Self-Test Check Questions
- 3 thought-provoking check questions with brief hidden answers.`;

    const notes = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an award-winning academic author and educator. Produce meticulous, beautifully formatted revision notes with clear markdown formatting.',
    });

    return res.json({ topic, subject, notes: notes.trim() });
  } catch (error: any) {
    console.error('Error in /api/smart-notes:', error);
    return res.status(500).json({
      error: error.message || 'Error generating smart notes',
      notes: `⚠️ Error in Smart Notes: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 7. Exam Preparation Generator (POST /api/exam-prep)
app.post('/api/exam-prep', async (req: Request, res: Response) => {
  const { subject = 'General', topic, examType = 'Standard Academic Exam', targetMarks = 'Mixed' } = req.body || {};
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Please provide a topic or syllabus module.' });
  }

  try {
    const prompt = `You are EduGenie Senior Exam Moderator and Paper Setter for "${subject}".
Target Topic: "${topic}"
Exam Context: ${examType} (Focus: ${targetMarks})

Create a high-yield exam preparation kit in markdown containing:
# 📖 Exam Preparation Pack: ${topic}

## 🎯 Section A: High-Yield Short Questions (2 Marks Each)
- 3 essential definitions/direct questions with model concise answers (2-3 sentences).

## 💡 Section B: Conceptual & Analytical Questions (5 Marks Each)
- 2 intermediate questions requiring explanation, differentiation, or step-by-step reasoning with model answer points.

## 🏆 Section C: Long-Answer / Problem-Solving Master Question (10 Marks)
- 1 comprehensive question with a step-by-step marking scheme rubrics (how examiners award marks).

## ⚡ Last-Minute 60-Second Revision Cheat Sheet
- Bulleted formula/key facts to review immediately before entering the exam hall.`;

    const examKit = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are a veteran university examiner. Formulate rigorous, realistic exam questions with realistic marking schemes.',
    });

    return res.json({ topic, subject, examKit: examKit.trim() });
  } catch (error: any) {
    console.error('Error in /api/exam-prep:', error);
    return res.status(500).json({
      error: error.message || 'Error generating exam prep kit',
      examKit: `⚠️ Error in Exam Prep: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 8. Personalized Study Planner (POST /api/study-planner)
app.post('/api/study-planner', async (req: Request, res: Response) => {
  const { subjects, daysUntilExam = 14, hoursPerDay = 3, weakAreas = '' } = req.body || {};
  const subjectsList = Array.isArray(subjects) ? subjects.join(', ') : (subjects || 'All Current Subjects');

  try {
    const prompt = `You are EduGenie AI Academic Success Coach & Study Strategist.
Create a personalized, science-backed study schedule:
- Subjects to cover: ${subjectsList}
- Days until exam / deadline: ${daysUntilExam} days
- Available daily study time: ${hoursPerDay} hours/day
- Student's weak areas / high priority topics: ${weakAreas || 'Balanced across all topics'}

Format the plan in clear markdown:
# 📅 Personalized Study Plan (${daysUntilExam} Days)
### 📊 Strategy Blueprint
- Total study hours: ${Number(daysUntilExam) * Number(hoursPerDay)} hours.
- Spaced Repetition & Active Recall distribution.

### ⏱️ Recommended Daily Pomodoro Rhythm
- Suggested study blocks (e.g. 25m focus + 5m break + 10m flashcards).

### 🗓️ Phase-by-Phase Timetable
- **Phase 1: Foundation & High-Yield Coverage** (Days 1 to ${Math.max(1, Math.floor(daysUntilExam * 0.5))})
- **Phase 2: Intensive Practice & Weak Areas** (Days ${Math.floor(daysUntilExam * 0.5) + 1} to ${Math.max(2, Math.floor(daysUntilExam * 0.8))})
- **Phase 3: Mock Tests & Rapid Review** (Final ${Math.max(1, daysUntilExam - Math.floor(daysUntilExam * 0.8))} Days)

### ✅ Day 1 Actionable Checklist
- Exactly what the student should accomplish today to start with high momentum.`;

    const plan = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an expert cognitive learning coach specializing in Pomodoro, spaced repetition, and realistic student schedule design.',
    });

    return res.json({ plan: plan.trim() });
  } catch (error: any) {
    console.error('Error in /api/study-planner:', error);
    return res.status(500).json({
      error: error.message || 'Error generating study plan',
      plan: `⚠️ Error in Study Planner: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 9. Coding Assistant (POST /api/code-assist)
app.post('/api/code-assist', async (req: Request, res: Response) => {
  const { language = 'Python', code = '', action = 'explain', question = '' } = req.body || {};
  if (!code && !question) {
    return res.status(400).json({ error: 'Please provide code snippet or a coding question.' });
  }

  try {
    const actionPrompts: Record<string, string> = {
      explain: 'Provide a clear, line-by-line pedagogical breakdown of what this code does, followed by Time & Space Complexity analysis (Big-O notation).',
      debug: 'Inspect this code for syntax bugs, logical flaws, off-by-one errors, or edge cases. Point out the bugs clearly, provide the corrected code, and explain the fix.',
      optimize: 'Rewrite this code for optimal execution speed, memory efficiency, and idiomatic readability. Compare old vs new Time/Space complexity.',
      test_cases: 'Generate comprehensive test cases and edge cases (empty inputs, large values, boundary constraints) to test this code thoroughly.',
    };

    const chosenActionPrompt = actionPrompts[action] || actionPrompts.explain;
    const prompt = `You are EduGenie Senior Computer Science Teaching Assistant.
Programming Language: ${language}
Task: ${chosenActionPrompt}
${question ? `Student Question: ${question}\n` : ''}

Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide your response with clear explanations and clean markdown formatted code blocks.`;

    const result = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an exceptional computer science mentor. Be precise, educational, and patient with beginners and advanced coders alike.',
    });

    return res.json({ result: result.trim(), language, action });
  } catch (error: any) {
    console.error('Error in /api/code-assist:', error);
    return res.status(500).json({
      error: error.message || 'Error in Code Assistant',
      result: `⚠️ Error in Coding Assistant: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 10. Study Material Analysis (POST /api/material-analysis)
app.post('/api/material-analysis', async (req: Request, res: Response) => {
  const { material = '', query = '', mode = 'qa' } = req.body || {};
  if (!material || typeof material !== 'string') {
    return res.status(400).json({ error: 'Please provide study material text.' });
  }

  try {
    let instruction = '';
    if (mode === 'qa') {
      instruction = `Answer the following student question STRICTLY based on the provided study material. Quote the relevant lines when applicable. If the material does not contain the answer, explicitly state that.\n\nStudent Question: ${query || 'Summarize the primary thesis of this material.'}`;
    } else if (mode === 'key_terms') {
      instruction = `Extract all critical academic terms, definitions, and named formulas found in this text. Format them as a glossary.`;
    } else if (mode === 'true_false') {
      instruction = `Generate 4 True/False questions based on subtle facts in this text, each accompanied by the correct verdict and an exact citation sentence from the material.`;
    } else {
      instruction = `Analyze this material, highlighting the central thesis, supporting arguments, and potential exam questions likely to be asked about it.`;
    }

    const prompt = `Study Material:\n"""\n${material.slice(0, 15000)}\n"""\n\nTask: ${instruction}`;

    const analysis = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are a diligent research assistant and academic analyst. Ground your responses strictly in the provided text.',
    });

    return res.json({ analysis: analysis.trim(), mode });
  } catch (error: any) {
    console.error('Error in /api/material-analysis:', error);
    return res.status(500).json({
      error: error.message || 'Error analyzing material',
      analysis: `⚠️ Error in Material Analysis: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 11. Personalized Learning Adapter (POST /api/personalized-learn)
app.post('/api/personalized-learn', async (req: Request, res: Response) => {
  const {
    topic,
    subject = 'General',
    educationLevel = 'High School',
    learningStyle = 'Real-world Analogies',
    currentUnderstanding = 'Beginner',
  } = req.body || {};

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Please provide a learning topic.' });
  }

  try {
    const prompt = `You are EduGenie Adaptive Learning Engine.
Topic: "${topic}" (Subject: ${subject})
Target Audience: ${educationLevel} student
Current Understanding: ${currentUnderstanding}
Preferred Learning Style: ${learningStyle}

Explain this concept perfectly calibrated to the student's level and learning style:
1. Start with an engaging hook in the chosen style (${learningStyle}).
2. Break down the core mechanism with appropriate cognitive load (no oversimplification, no unneeded jargon).
3. Provide a concrete scenario or relatable real-world example.
4. "Check Your Understanding" micro-challenge (1 question with a hint).`;

    const explanation = await generateWithFallback({
      contents: prompt,
      systemInstruction:
        'You are a pedagogical expert skilled in Differentiated Instruction. Seamlessly adapt tone, vocabulary, and conceptual density.',
    });

    return res.json({ topic, explanation: explanation.trim(), educationLevel, learningStyle });
  } catch (error: any) {
    console.error('Error in /api/personalized-learn:', error);
    return res.status(500).json({
      error: error.message || 'Error generating personalized lesson',
      explanation: `⚠️ Error in Personalized Learning: ${error.message || 'Service unavailable'}`,
    });
  }
});

// 12. Enhanced Quiz Generator (POST /api/quiz-custom) with rationales
app.post('/api/quiz-custom', async (req: Request, res: Response) => {
  const { topic, subject = 'General', questionCount = 3, difficulty = 'medium' } = req.body || {};
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Please provide a topic or passage for the quiz.' });
  }

  const count = Math.min(Math.max(Number(questionCount) || 3, 1), 10);

  try {
    const prompt = `You are an expert exam question generator for ${subject}.
Generate exactly ${count} multiple-choice questions on: "${topic}".
Difficulty level: ${difficulty}.

For each question, provide:
- "question": Clear question stem
- "options": Array of exactly 4 plausible choices
- "answer": The exact string of the correct choice (must match one of the options)
- "explanation": A 1-2 sentence rationale explaining why this answer is correct and why common alternatives are wrong.

Ensure valid JSON output.`;

    const rawOutput = await generateWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['question', 'options', 'answer', 'explanation'],
        },
      },
    });

    const cleaned = cleanJsonBlock(rawOutput);
    const quiz = JSON.parse(cleaned);
    return res.json({ quiz, topic, subject, difficulty });
  } catch (error: any) {
    console.error('Error in /api/quiz-custom:', error);
    return res.status(500).json({
      quiz: [{ error: `⚠️ Error in Custom Quiz: ${error.message || 'Failed to generate'}` }],
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EduGenie AI Backend',
    features: [
      '1. AI Learning Assistant (/qa)',
      '2. Smart Notes Generator (/api/smart-notes)',
      '3. AI Summarizer (/summarize)',
      '4. Quiz Generator (/quiz, /api/quiz-custom)',
      '5. Exam Preparation (/api/exam-prep)',
      '6. Personalized Study Planner (/api/study-planner)',
      '7. Coding Assistant (/api/code-assist)',
      '8. Study Material Analysis (/api/material-analysis)',
      '9. Personalized Learning (/api/personalized-learn)',
      '10. Quiz Score & Progress',
      '11. Multi-Subject Support',
      '12. Responsive Design',
    ],
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Assets Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
