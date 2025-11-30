const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const crypto = require('crypto');
const axios = require('axios');
const ExamSession = require('../models/ExamSession');
const User = require('../models/User');

const readFileAsync = promisify(fs.readFile);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const QUESTION_CHOICES = [10, 20, 30];
const MAX_CONTEXT_CHARS = 6000;
const REQUEST_TIMEOUT = Number(process.env.OPENROUTER_TIMEOUT_MS || 20000);
const FALLBACK_NOTICE = '\n\n⚠️ Generated locally because AI services were unavailable.';

const randomId = () => crypto.randomBytes(6).toString('hex');

const resolveStudentId = async (req) => {
  if (req?.user?.id) {
    return req.user.id;
  }

  const name = req?.user?.name;
  if (!name) return null;

  try {
    const doc = await User.findByName(name);
    if (doc?.id) {
      req.user = { ...(req.user || {}), id: doc.id };
      return doc.id;
    }
  } catch (error) {
    console.warn('Failed to resolve student by name', error.message);
  }

  return null;
};

const metadataPath = (fileId) => path.join(UPLOAD_DIR, `${fileId}.json`);
const textPath = (fileId) => path.join(UPLOAD_DIR, `${fileId}.txt`);

const loadMetadata = async (fileId) => {
  const file = metadataPath(fileId);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = await readFileAsync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load metadata', fileId, error.message);
    return null;
  }
};

const sanitizeLine = (line = '') =>
  line
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/download(ed)?\s+from[^.]+/gi, '')
    .replace(/join now:?/gi, '')
    .replace(/share this:?/gi, '')
    .trim();

const cleanContext = (text = '') =>
  text
    .split(/\r?\n/)
    .map(sanitizeLine)
    .filter(Boolean)
    .join('\n');

const buildContextSnippet = (text = '', limit = MAX_CONTEXT_CHARS) => cleanContext(text).slice(0, limit);

const truncate = (text = '', limit = 200) => (text.length > limit ? `${text.slice(0, limit - 1).trim()}…` : text);

const extractJsonPayload = (message = '') => {
  if (!message) return null;
  const codeBlockMatch = message.match(/```json([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const bracketMatch = message.match(/\[[\s\S]*\]/);
  if (bracketMatch) {
    return bracketMatch[0];
  }
  return message.trim();
};

const callOpenRouter = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY missing');
  }

  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
    {
      model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content:
            'You create challenging MCQs strictly from the supplied PDF excerpt. Respond with JSON only. Never mention being an AI.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    },
    {
      timeout: REQUEST_TIMEOUT,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'http://localhost:5173',
      },
    }
  );

  const message = response.data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('OpenRouter returned empty content.');
  }
  return message;
};

const callGroq = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  const response = await axios.post(
    `${process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'}/chat/completions`,
    {
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You create challenging MCQs strictly from the supplied PDF excerpt. Respond with JSON only. Never mention being an AI.',
        },
        { role: 'user', content: prompt },
      ],
    },
    {
      timeout: REQUEST_TIMEOUT,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const message = response.data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('Groq returned empty content.');
  }
  return message;
};

const normalizeQuestions = (raw, expectedCount) => {
  if (!Array.isArray(raw)) return [];
  const normalized = [];

  raw.forEach((item, index) => {
    if (!item) return;
    const prompt = String(item.prompt || item.question || '').trim();
    const explanation = String(item.explanation || item.rationale || '').trim();
    const options = Array.isArray(item.options ? item.options : item.choices)
      ? (item.options || item.choices).map((opt) => String(opt).trim()).filter(Boolean)
      : [];
    const answerIndex = Number.isFinite(item.answerIndex)
      ? item.answerIndex
      : Number.isFinite(item.answer_index)
        ? item.answer_index
        : Number.isFinite(item.correctOption)
          ? item.correctOption
          : null;

    if (!prompt || options.length < 2 || !Number.isInteger(answerIndex)) {
      return;
    }

    const finalOptions = options.slice(0, 4);
    if (answerIndex < 0 || answerIndex >= finalOptions.length) {
      return;
    }

    normalized.push({
      id: item.id?.toString() || `q-${randomId()}-${index}`,
      prompt,
      options: finalOptions,
      answer_index: answerIndex,
      explanation,
    });
  });

  if (normalized.length > expectedCount) {
    return normalized.slice(0, expectedCount);
  }

  return normalized;
};

const pickSentences = (context = '') =>
  context
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40);

const generateFallbackQuestions = (context, count) => {
  const sentences = pickSentences(context);
  if (!sentences.length) return [];

  const questions = [];
  for (let i = 0; i < count; i += 1) {
    const baseSentence = sentences[i % sentences.length];
    const distractor = sentences[(i + 1) % sentences.length] || 'A generic statement not mentioned in the excerpt.';
    questions.push({
      id: `fallback-${randomId()}-${i}`,
      prompt: `According to the PDF, which statement about this topic is accurate?`,
      options: [truncate(baseSentence, 140), truncate(distractor, 140), 'Both statements are accurate', 'None of these statements are supported'],
      answer_index: 0,
      explanation: `The PDF explicitly states: ${truncate(baseSentence, 200)}${FALLBACK_NOTICE}`,
    });
  }

  return questions;
};

const getQuestionPrompt = (context, count) => `Generate EXACTLY ${count} multiple-choice questions strictly from this PDF excerpt.

Context:
"""
${context}
"""

Rules:
- Output JSON array. No commentary or markdown.
- Each item: {
    "prompt": "",
    "options": ["A", "B", "C", "D"],
    "answerIndex": <number>,
    "explanation": ""
  }
- Ensure only one correct option.
- Mix easy, medium, and hard difficulty.
- Use facts from the excerpt only.`;

const getQuestionId = (question) => {
  if (!question) return '';
  if (typeof question.id === 'string') return question.id;
  if (question._id?.toString) return question._id.toString();
  return '';
};

const formatQuestionForClient = (question, { revealAnswer = false } = {}) => {
  const formatted = {
    id: getQuestionId(question),
    prompt: question.prompt,
    options: question.options,
    explanation: question.explanation ? truncate(question.explanation, 320) : '',
  };

  if (revealAnswer && Number.isInteger(question.answer_index)) {
    formatted.answerIndex = question.answer_index;
  }

  return formatted;
};

const buildBreakdown = (questions = [], answerMap = new Map()) =>
  questions.map((question) => {
    const questionId = getQuestionId(question);
    const selected = answerMap.has(questionId) ? answerMap.get(questionId) : null;
    const correctIndex = Number.isInteger(question.answer_index) ? question.answer_index : null;
    const isCorrect = Number.isInteger(selected) && selected === correctIndex;

    return {
      questionId,
      prompt: question.prompt,
      options: question.options,
      explanation: question.explanation,
      correctIndex,
      selectedIndex: Number.isInteger(selected) ? selected : null,
      isCorrect,
    };
  });

const buildAnswerMap = (answers = [], { key = 'questionId', value = 'selectedIndex' } = {}) => {
  const map = new Map();
  (answers || []).forEach((entry) => {
    const questionId = entry?.[key];
    const selected = entry?.[value];
    if (!questionId || !Number.isInteger(selected)) {
      return;
    }
    map.set(questionId.toString(), selected);
  });
  return map;
};

exports.generateExam = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { fileId, questionCount } = req.body || {};
    if (!fileId || !QUESTION_CHOICES.includes(Number(questionCount))) {
      return res.status(400).json({ success: false, message: 'fileId and valid questionCount (10/20/30) are required.' });
    }

    const textFile = textPath(fileId);
    if (!fs.existsSync(textFile)) {
      return res.status(404).json({ success: false, message: 'PDF text not found. Re-upload the file.' });
    }

    const metadata = await loadMetadata(fileId);
    const rawContext = await readFileAsync(textFile, 'utf-8');
    const snippet = buildContextSnippet(rawContext, MAX_CONTEXT_CHARS);
    const prompt = getQuestionPrompt(snippet, Number(questionCount));

    let questions = [];

    try {
      const message = await callOpenRouter(prompt);
      const jsonPayload = extractJsonPayload(message);
      questions = normalizeQuestions(JSON.parse(jsonPayload), Number(questionCount));
    } catch (error) {
      console.warn('OpenRouter exam generation failed', error.message);
      try {
        const message = await callGroq(prompt);
        const jsonPayload = extractJsonPayload(message);
        questions = normalizeQuestions(JSON.parse(jsonPayload), Number(questionCount));
      } catch (groqErr) {
        console.warn('Groq exam generation failed, using fallback', groqErr.message);
        questions = generateFallbackQuestions(snippet, Number(questionCount));
      }
    }

    if (!questions.length) {
      questions = generateFallbackQuestions(snippet, Number(questionCount));
    }

    const sessionDoc = await ExamSession.create({
      student_id: studentId,
      file_id: fileId,
      file_name: metadata?.originalName || metadata?.storedName || 'PDF',
      question_count: Number(questionCount),
      questions,
      status: 'draft',
    });

    res.json({
      success: true,
      sessionId: sessionDoc._id.toString(),
      questions: questions.map(formatQuestionForClient),
      fileName: sessionDoc.file_name,
      questionCount: sessionDoc.question_count,
    });
  } catch (error) {
    console.error('generateExam error', error);
    res.status(500).json({ success: false, message: 'Failed to generate exam questions.' });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { sessionId, answers } = req.body || {};
    if (!sessionId || !Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ success: false, message: 'sessionId and answers are required.' });
    }

    const session = await ExamSession.findOne({ _id: sessionId, student_id: studentId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Exam session not found.' });
    }

    if (!session.questions?.length) {
      return res.status(400).json({ success: false, message: 'This exam session has no questions to grade.' });
    }

    const answerMap = buildAnswerMap(answers);
    if (!answerMap.size) {
      return res.status(400).json({ success: false, message: 'At least one valid answer is required.' });
    }

    const breakdown = buildBreakdown(session.questions, answerMap);
    const score = breakdown.filter((item) => item.isCorrect).length;

    session.answers = breakdown.map((item) => ({
      question_id: item.questionId,
      selected_index: Number.isInteger(item.selectedIndex) ? item.selectedIndex : -1,
      is_correct: item.isCorrect,
    }));
    session.score = score;
    session.status = 'completed';
    session.completed_at = new Date();
    await session.save();

    res.json({
      success: true,
      score,
      total: session.question_count,
      breakdown,
      fileName: session.file_name,
      completedAt: session.completed_at,
    });
  } catch (error) {
    console.error('submitExam error', error);
    res.status(500).json({ success: false, message: 'Failed to grade exam.' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    const session = await ExamSession.findOne({ _id: sessionId, student_id: studentId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const revealAnswer = session.status === 'completed';
    const storedMap = buildAnswerMap(session.answers, { key: 'question_id', value: 'selected_index' });
    const breakdown = revealAnswer ? buildBreakdown(session.questions, storedMap) : null;

    res.json({
      success: true,
      session: {
        id: session._id.toString(),
        fileId: session.file_id,
        fileName: session.file_name,
        questionCount: session.question_count,
        status: session.status,
        score: session.score,
        completedAt: session.completed_at,
        questions: session.questions.map((question) => formatQuestionForClient(question, { revealAnswer })),
        breakdown,
      },
    });
  } catch (error) {
    console.error('getSession error', error);
    res.status(500).json({ success: false, message: 'Failed to load session.' });
  }
};

exports.listHistory = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessions = await ExamSession.find({ student_id: studentId, status: 'completed' })
      .sort({ completed_at: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      history: sessions.map((session) => ({
        id: session._id.toString(),
        fileName: session.file_name,
        score: session.score,
        total: session.question_count,
        completedAt: session.completed_at,
      })),
    });
  } catch (error) {
    console.error('listHistory error', error);
    res.status(500).json({ success: false, message: 'Failed to load exam history.' });
  }
};
