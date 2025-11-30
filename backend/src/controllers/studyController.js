const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const axios = require('axios');
const StudyAsset = require('../models/StudyAsset');
const StudyDeck = require('../models/StudyDeck');
const User = require('../models/User');

const readFileAsync = promisify(fs.readFile);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const MAX_CONTEXT_CHARS = 8000;
const MAX_ASSET_CHARS = 20000;
const MAX_COUNT = 30;
const REQUEST_TIMEOUT = Number(process.env.OPENROUTER_TIMEOUT_MS || 20000);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
    console.warn('Failed to resolve student by name', name, error.message);
  }

  return null;
};

const callOpenRouter = async (messages) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY missing');
  }

  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
    {
      model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
      messages,
      temperature: 0.3,
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
    throw new Error('OpenRouter returned empty response');
  }

  return message;
};

const callGroq = async (messages) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  const response = await axios.post(
    `${process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'}/chat/completions`,
    {
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages,
      temperature: 0.2,
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
    throw new Error('Groq returned empty response');
  }

  return message;
};

const extractJsonPayload = (message = '') => {
  if (!message) return null;
  const block = message.match(/```json([\s\S]*?)```/i);
  if (block) {
    return block[1].trim();
  }
  const fallback = message.match(/\[[\s\S]*\]/);
  if (fallback) {
    return fallback[0];
  }
  return message.trim();
};

const cleanText = (text = '') => text.replace(/\s+/g, ' ').trim();

const buildPreview = (text = '') => {
  const cleaned = cleanText(text);
  if (cleaned.length <= 200) return cleaned;
  return `${cleaned.slice(0, 197)}…`;
};

const readPdfText = async (fileId) => {
  if (!fileId) return '';
  const textPath = path.join(UPLOAD_DIR, `${fileId}.txt`);
  if (!fs.existsSync(textPath)) {
    throw new Error('Referenced PDF text not found');
  }
  const raw = await readFileAsync(textPath, 'utf-8');
  return raw || '';
};

const normalizeFlashcards = (rawCards = [], count) => {
  if (!Array.isArray(rawCards)) return [];
  const cards = rawCards
    .map((card) => ({
      prompt: cleanText(card?.prompt || card?.question || ''),
      answer: cleanText(card?.answer || card?.response || ''),
    }))
    .filter((card) => card.prompt && card.answer);

  return cards.slice(0, count);
};

const normalizeQuizQuestions = (rawQuestions = [], count) => {
  if (!Array.isArray(rawQuestions)) return [];
  const questions = rawQuestions
    .map((question, index) => {
      const options = Array.isArray(question?.options || question?.choices)
        ? (question.options || question.choices).map((opt) => cleanText(opt)).filter(Boolean)
        : [];
      const answerIndex = Number.isInteger(question?.answerIndex)
        ? question.answerIndex
        : Number.isInteger(question?.answer_index)
          ? question.answer_index
          : Number.isInteger(question?.correctOption)
            ? question.correctOption
            : null;

      if (!cleanText(question?.prompt) || options.length < 2 || !Number.isInteger(answerIndex)) {
        return null;
      }

      const normalizedAnswerIndex = clamp(answerIndex, 0, options.length - 1);

      return {
        id: question?.id?.toString() || `study-question-${index}`,
        prompt: cleanText(question.prompt),
        options: options.slice(0, 4),
        answer_index: normalizedAnswerIndex,
        explanation: cleanText(question?.explanation || ''),
      };
    })
    .filter(Boolean);

  return questions.slice(0, count);
};

const fallbackFlashcards = (text, count) => {
  const sentences = cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 40);
  if (!sentences.length) {
    return [];
  }
  return Array.from({ length: count }).map((_, index) => {
    const sentence = sentences[index % sentences.length];
    return {
      prompt: `Explain this concept: ${sentence.slice(0, 120)}`,
      answer: sentence,
    };
  });
};

const fallbackQuiz = (text, count) => {
  const sentences = cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 50);
  if (!sentences.length) {
    return [];
  }
  return Array.from({ length: count }).map((_, index) => {
    const base = sentences[index % sentences.length];
    const distractor = sentences[(index + 1) % sentences.length] || 'A statement not found in the notes.';
    return {
      id: `fallback-${index}`,
      prompt: `Which statement matches the notes?`,
      options: [base.slice(0, 140), distractor.slice(0, 140), 'Both statements', 'None of these'],
      answer_index: 0,
      explanation: base,
    };
  });
};

const generateWithAi = async ({ type, count, context }) => {
  const userContent = `Study text:\n"""${context}"""\n\nInstructions: ${
    type === 'flashcards'
      ? `Create EXACTLY ${count} two-sided flashcards as JSON array. Use this schema:
[
  { "prompt": "Question side", "answer": "Detailed answer" }
]
Use only the provided text.`
      : `Create EXACTLY ${count} multiple-choice questions as JSON array. Use this schema:
[
  { "id": "unique-id", "prompt": "Question text", "options": ["A","B","C","D"], "answerIndex": 0, "explanation": "Why this is correct" }
]
Use only the provided text.`
  }`;

  const messages = [
    {
      role: 'system',
      content:
        'You convert lecture notes into study tools. Always return valid JSON with the requested schema. Avoid any commentary outside the JSON.',
    },
    { role: 'user', content: userContent },
  ];

  try {
    const message = await callOpenRouter(messages);
    const jsonPayload = extractJsonPayload(message);
    const parsed = JSON.parse(jsonPayload || '[]');
    if (type === 'flashcards') {
      return normalizeFlashcards(parsed, count);
    }
    return normalizeQuizQuestions(parsed, count);
  } catch (error) {
    console.warn('OpenRouter unavailable for study tools, trying Groq', error.message);
    try {
      const message = await callGroq(messages);
      const jsonPayload = extractJsonPayload(message);
      const parsed = JSON.parse(jsonPayload || '[]');
      if (type === 'flashcards') {
        return normalizeFlashcards(parsed, count);
      }
      return normalizeQuizQuestions(parsed, count);
    } catch (groqErr) {
      console.warn('Groq unavailable for study tools, using fallback', groqErr.message);
      if (type === 'flashcards') {
        return fallbackFlashcards(context, count);
      }
      return fallbackQuiz(context, count);
    }
  }
};

exports.createAsset = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, content, sourceType = 'text', sourceReference = '', fileId } = req.body || {};

    let normalizedContent = '';
    if (fileId) {
      normalizedContent = await readPdfText(fileId);
    } else if (typeof content === 'string' && content.trim().length) {
      normalizedContent = content;
    }

    if (!normalizedContent.trim().length) {
      return res.status(400).json({ success: false, message: 'Please provide content or reference a PDF file.' });
    }

    const truncatedContent = cleanText(normalizedContent).slice(0, MAX_ASSET_CHARS);
    const wordCount = truncatedContent.split(/\s+/).filter(Boolean).length;

    const asset = await StudyAsset.create({
      student_id: studentId,
      title: title?.trim() || 'Study asset',
      source_type: fileId ? 'pdf' : sourceType,
      source_reference: fileId || sourceReference || '',
      content: truncatedContent,
      content_preview: buildPreview(truncatedContent),
      word_count: wordCount,
    });

    res.json({ success: true, asset });
  } catch (error) {
    console.error('createAsset error', error);
    res.status(500).json({ success: false, message: 'Failed to save study asset' });
  }
};

exports.listAssets = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const assets = await StudyAsset.find({ student_id: studentId })
      .sort({ created_at: -1 })
      .limit(15)
      .lean();

    res.json({ success: true, assets });
  } catch (error) {
    console.error('listAssets error', error);
    res.status(500).json({ success: false, message: 'Failed to load assets' });
  }
};

exports.generateDeck = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { assetId, type, count = 10 } = req.body || {};
    if (!assetId || !['flashcards', 'quiz'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid deck request.' });
    }

    const asset = await StudyAsset.findOne({ _id: assetId, student_id: studentId }).lean();
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Study asset not found.' });
    }

    const limitedCount = clamp(Number(count) || 10, 5, MAX_COUNT);
    const context = asset.content.slice(0, MAX_CONTEXT_CHARS);

    let generated = await generateWithAi({ type, count: limitedCount, context });
    if (!generated.length) {
      generated = type === 'flashcards' ? fallbackFlashcards(context, limitedCount) : fallbackQuiz(context, limitedCount);
    }

    const deck = await StudyDeck.create({
      student_id: studentId,
      asset_id: asset._id,
      type,
      title: `${type === 'flashcards' ? 'Flashcards' : 'Quiz'} · ${asset.title}`,
      settings: { count: limitedCount },
      cards: type === 'flashcards' ? generated : [],
      questions: type === 'quiz' ? generated : [],
      score: 0,
      total: type === 'quiz' ? generated.length : 0,
    });

    res.json({
      success: true,
      deck: {
        id: deck._id.toString(),
        type: deck.type,
        title: deck.title,
        cards: deck.cards,
        questions: deck.questions,
        total: deck.total,
        status: deck.status,
      },
    });
  } catch (error) {
    console.error('generateDeck error', error);
    res.status(500).json({ success: false, message: 'Failed to generate study deck.' });
  }
};

exports.listDecks = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { assetId } = req.query;
    const filters = { student_id: studentId };
    if (assetId) {
      filters.asset_id = assetId;
    }

    const decks = await StudyDeck.find(filters)
      .sort({ created_at: -1 })
      .limit(15)
      .lean();

    res.json({ success: true, decks });
  } catch (error) {
    console.error('listDecks error', error);
    res.status(500).json({ success: false, message: 'Failed to load decks' });
  }
};

exports.getDeck = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { deckId } = req.params;
    if (!deckId) {
      return res.status(400).json({ success: false, message: 'deckId is required.' });
    }

    const deck = await StudyDeck.findOne({ _id: deckId, student_id: studentId }).lean();
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }

    res.json({ success: true, deck });
  } catch (error) {
    console.error('getDeck error', error);
    res.status(500).json({ success: false, message: 'Failed to load deck' });
  }
};

exports.submitDeck = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { deckId } = req.params;
    const { answers = [] } = req.body || {};
    if (!deckId || !Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ success: false, message: 'deckId and answers are required.' });
    }

    const deck = await StudyDeck.findOne({ _id: deckId, student_id: studentId });
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }

    if (deck.type !== 'quiz') {
      return res.status(400).json({ success: false, message: 'Only quiz decks can be submitted.' });
    }

    if (!deck.questions?.length) {
      return res.status(400).json({ success: false, message: 'This deck has no quiz questions.' });
    }

    const answerMap = new Map();
    answers.forEach((entry) => {
      if (entry?.questionId && Number.isInteger(entry.selectedIndex)) {
        answerMap.set(entry.questionId.toString(), entry.selectedIndex);
      }
    });

    if (!answerMap.size) {
      return res.status(400).json({ success: false, message: 'Provide at least one answer.' });
    }

    const breakdown = deck.questions.map((question) => {
      const selected = answerMap.has(question.id) ? answerMap.get(question.id) : null;
      const isCorrect = Number.isInteger(selected) && selected === question.answer_index;
      return {
        questionId: question.id,
        prompt: question.prompt,
        options: question.options,
        explanation: question.explanation,
        correctIndex: question.answer_index,
        selectedIndex: Number.isInteger(selected) ? selected : null,
        isCorrect,
      };
    });

    const score = breakdown.filter((entry) => entry.isCorrect).length;

    deck.responses = breakdown.map((entry) => ({
      question_id: entry.questionId,
      selected_index: Number.isInteger(entry.selectedIndex) ? entry.selectedIndex : -1,
      is_correct: entry.isCorrect,
    }));
    deck.score = score;
    deck.total = deck.questions.length;
    deck.status = 'completed';
    await deck.save();

    res.json({
      success: true,
      score,
      total: deck.total,
      breakdown,
      deckId: deck._id.toString(),
    });
  } catch (error) {
    console.error('submitDeck error', error);
    res.status(500).json({ success: false, message: 'Failed to score deck.' });
  }
};
