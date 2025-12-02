const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const PdfChat = require('../models/PdfChat');
const User = require('../models/User');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'chatId is required' });
    }

    const chat = await PdfChat.findOne({ _id: chatId, student_id: studentId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    await PdfChat.deleteOne({ _id: chat._id });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteChat error', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
};

exports.createChat = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { fileId, title } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    const metaFile = metadataPath(fileId);
    if (!fs.existsSync(metaFile)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const metadataRaw = await readFileAsync(metaFile, 'utf-8');
    const metadata = JSON.parse(metadataRaw);

    const chatDoc = await PdfChat.create({
      student_id: studentId,
      file_id: fileId,
      file_name: metadata?.originalName || metadata?.storedName || '',
      title: buildChatTitle(title || 'New chat', metadata?.originalName, title),
      preview: '',
      entries: [],
      message_count: 0,
      last_interaction_at: new Date(),
    });

    res.json({ success: true, chat: mapChatSummary(chatDoc) });
  } catch (error) {
    console.error('createChat error', error);
    res.status(500).json({ success: false, message: 'Failed to create chat' });
  }
};

ensureUploadDir();

const metadataPath = (fileId) => path.join(UPLOAD_DIR, `${fileId}.json`);
const textPath = (fileId) => path.join(UPLOAD_DIR, `${fileId}.txt`);
const FALLBACK_NOTICE = '';
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Failed to delete file', filePath, err.message);
  }
};

const resolveStudentId = async (req) => {
  if (req?.user?.id) {
    return req.user.id;
  }

  const possibleName = req?.user?.name;
  if (!possibleName) return null;

  try {
    const userDoc = await User.findByName(possibleName);
    if (userDoc?.id) {
      req.user = { ...(req.user || {}), id: userDoc.id };
      return userDoc.id;
    }
  } catch (error) {
    console.warn('Failed to resolve user by name', possibleName, error.message);
  }

  return null;
};

const loadMetadata = async (fileId) => {
  const metaFile = metadataPath(fileId);
  if (!fs.existsSync(metaFile)) return null;
  try {
    const raw = await readFileAsync(metaFile, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse metadata for', fileId, error);
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

const splitParagraphs = (text) =>
  cleanContext(text)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40);

const truncate = (text = '', length = 240) => (text.length > length ? `${text.slice(0, length).trim()}…` : text);

const buildChatTitle = (question, fileName, providedTitle) => {
  const raw = providedTitle?.trim() || question?.trim() || fileName || 'PDF chat';
  return truncate(raw, 60);
};

const toIsoString = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const mapChatSummary = (chat) => {
  if (!chat) return null;
  const id = chat._id?.toString?.() || chat.id || '';
  return {
    id,
    title: chat.title || 'PDF chat',
    preview: chat.preview || '',
    messageCount: chat.message_count ?? chat.entries?.length ?? 0,
    lastInteractionAt: toIsoString(chat.last_interaction_at || chat.updated_at || chat.created_at),
    fileId: chat.file_id,
    fileName: chat.file_name,
    fileRemoved: Boolean(chat.file_removed),
  };
};

const mapChatEntries = (chat) => {
  if (!chat?.entries) return [];
  const chatId = chat._id?.toString?.() || chat.id || 'chat';
  const sorted = [...chat.entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted.map((entry, index) => ({
    id: entry._id?.toString?.() || `${chatId}-${index}`,
    question: entry.question,
    answer: entry.answer,
    timestamp: toIsoString(entry.timestamp),
  }));
};

const persistChatEntry = async ({
  studentId,
  fileId,
  fileName,
  chatId,
  question,
  answer,
  chatTitle,
}) => {
  if (!studentId || !fileId) return null;

  const normalizedQuestion = question || 'Summary request';
  const normalizedAnswer = answer || '';
  const now = new Date();

  let chatDoc = null;
  if (chatId) {
    try {
      chatDoc = await PdfChat.findOne({ _id: chatId, student_id: studentId });
    } catch (error) {
      console.warn('Invalid chatId provided, creating new chat instead', chatId);
      chatDoc = null;
    }
  }

  if (!chatDoc) {
    chatDoc = await PdfChat.create({
      student_id: studentId,
      file_id: fileId,
      file_name: fileName,
      title: buildChatTitle(normalizedQuestion, fileName, chatTitle),
      preview: truncate(normalizedAnswer, 220),
      entries: [],
    });
  }

  chatDoc.entries.push({ question: normalizedQuestion, answer: normalizedAnswer, timestamp: now });
  if (chatDoc.entries.length > 50) {
    chatDoc.entries = chatDoc.entries.slice(-50);
  }

  chatDoc.message_count = chatDoc.entries.length;
  chatDoc.preview = truncate(normalizedAnswer, 220);
  chatDoc.last_interaction_at = now;

  await chatDoc.save();

  return {
    chat: mapChatSummary(chatDoc),
    entry: {
      id: `${chatDoc._id}-${now.getTime()}`,
      question: normalizedQuestion,
      answer: normalizedAnswer,
      timestamp: now.toISOString(),
    },
  };
};

const STOPWORDS = new Set([
  'the', 'and', 'that', 'with', 'this', 'from', 'have', 'will', 'your', 'about', 'into', 'their',
  'when', 'then', 'they', 'them', 'been', 'were', 'which', 'while', 'there', 'these', 'those', 'very',
]);

const tokenizeWords = (text) => text.toLowerCase().match(/[a-z]{3,}/g) || [];

const extractKeywords = (question = '') =>
  (question
    .toLowerCase()
    .match(/[a-z0-9]{3,}/g) || [])
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));

const scoreSentences = (sentences) => {
  const freq = new Map();
  sentences.forEach((sentence) => {
    tokenizeWords(sentence).forEach((word) => {
      if (STOPWORDS.has(word)) return;
      freq.set(word, (freq.get(word) || 0) + 1);
    });
  });

  return sentences.map((sentence, index) => {
    const score = tokenizeWords(sentence).reduce((acc, word) => acc + (freq.get(word) || 0), 0);
    return { sentence, score, index };
  });
};

const buildFallbackSummary = (context, question) => {
  const cleanText = cleanContext(context);
  const sentences = cleanText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);

  if (!sentences.length) {
    return 'Unable to extract meaningful text from this PDF yet. Try uploading a clearer copy.';
  }

  const rankedSentences = scoreSentences(sentences);
  const highlightItems = rankedSentences
    .slice()
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .sort((a, b) => a.index - b.index)
    .map((item) => `• ${truncate(item.sentence, 220)}`);

  const paragraphs = splitParagraphs(cleanText);
  const formulaHints = paragraphs
    .filter((p) => /[=±×]/.test(p))
    .slice(0, 2)
    .map((p) => `• ${truncate(p, 160)}`);

  const questionSeeds = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('?'));

  const rankedPlain = rankedSentences.map((item) => item.sentence);
  const suggestions = (questionSeeds.length ? questionSeeds : rankedPlain)
    .slice(0, 3)
    .map((line, idx) => `Q${idx + 1}: ${truncate(line, 180)}`);

  return [
    '**Highlights from your PDF:**',
    ...highlightItems,
    '',
    '**Formula / data nuggets:**',
    formulaHints.length ? formulaHints.join('\n') : '• Not enough formula-heavy sections detected in this excerpt.',
    '',
    '**Suggested quick questions:**',
    suggestions.join('\n'),
    '',
    `Prompt: ${question || 'General summary'}`,
  ].join('\n');
};

const buildFallbackAnswer = (context, question) => {
  const cleanText = cleanContext(context);
  const sentences = cleanText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const keywords = extractKeywords(question);

  const ranked = scoreSentences(sentences);

  if (keywords.length) {
    let best = null;
    ranked.forEach((item) => {
      const lower = item.sentence.toLowerCase();
      const keywordScore = keywords.reduce((acc, word) => (lower.includes(word) ? acc + 1 : acc), 0);
      const blended = keywordScore * 5 + item.score;
      if (!best || blended > best.score) {
        best = { sentence: item.sentence, score: blended };
      }
    });

    if (best && best.score > 0) {
      return [
        `Summary focus: ${truncate(best.sentence, 260)}`,
        question ? `Answering “${question}” using the PDF snippet above.` : null,
        'Tip: cross-check this section with your class notes for accuracy.',
      ]
        .filter(Boolean)
        .join('\n');
    }
  }

  const topSentence = ranked.sort((a, b) => b.score - a.score)[0];
  if (topSentence) {
    return `Summary: ${truncate(topSentence.sentence, 320)}`;
  }

  return buildFallbackSummary(context, question);
};

const isSmallTalk = (question = '') => {
  const trimmed = question.trim().toLowerCase();
  if (!trimmed) return true;
  const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste', 'yo', 'sup'];
  if (greetings.includes(trimmed)) return true;
  if (trimmed.length < 4) return true;
  const smallTalkPatterns = [/^(hi|hello|hey)\s+[a-z!?.]*$/, /(how\s+are\s+you|what's\s+up|wyd)\??$/];
  return smallTalkPatterns.some((pattern) => pattern.test(trimmed));
};

const shouldFallback = (error) => {
  if (!error) return true;
  const status = error.response?.status;
  if (!status) return true;
  return [401, 402, 403, 408, 409, 412, 429].includes(status) || status >= 500;
};

const buildContextSnippet = (text, question, limit = 6000) => {
  const cleanText = cleanContext(text);
  const keywords = extractKeywords(question);
  if (!keywords.length) {
    return { snippet: cleanText.substring(0, limit), hasKeywordMatch: false };
  }

  const lower = cleanText.toLowerCase();
  const windowSize = Math.floor(limit / 3);
  let bestSlice = cleanText.substring(0, limit);
  let bestHits = 0;

  for (let i = 0; i < lower.length; i += windowSize) {
    const slice = lower.substring(i, i + limit);
    const hits = keywords.reduce((acc, word) => (slice.includes(word) ? acc + 1 : acc), 0);
    if (hits > bestHits) {
      bestHits = hits;
      bestSlice = cleanText.substring(i, i + limit);
    }
  }

  return { snippet: bestSlice, hasKeywordMatch: bestHits > 0 };
};

const buildGeneralGuidance = (question) => {
  const topic = (question && question.trim()) ? question.trim() : 'your exam prep';
  return [
    `🔎 I didn’t see specific notes about "${topic}" inside the current PDF, so let’s keep you moving forward anyway.`,
    `1. Write down the 3 concepts you feel least confident about for "${topic}" and review a short summary for each.`,
    `2. Turn those summaries into quick self-test questions and answer them without looking at your notes.`,
    `3. Practice one timed mini-problem or past-paper question so your brain switches into exam mode.`,
    `4. Close the session by listing one action you’ll do next (e.g., "revise derivations", "memorize formulas", "teach a friend").`,
    `🚀 Upload or reference notes about "${topic}" whenever you can, and I’ll stitch those details into your next answer.`,
  ].join('\n');
};

const stripContextApology = (answer = '') => {
  if (!answer) return '';
  const lines = answer.split(/\n+/).filter((line) => {
    const lower = line.trim().toLowerCase();
    if (!lower) return false;
    if (lower.startsWith('unfortunately')) return false;
    if (lower.startsWith("i'm sorry")) return false;
    if (lower.includes("don't have enough context")) return false;
    if (lower.includes("no context")) return false;
    if (lower.includes('unable to answer')) return false;
    if (lower.includes('i cannot provide')) return false;
    if (lower.includes("i can't provide")) return false;
    if (lower.includes('since i cannot')) return false;
    if (lower.includes('cannot directly answer')) return false;
    return true;
  });

  return lines.join('\n').trim();
};

const blendWithGeneralAdvice = (answer, hasKeywordMatch, question) => {
  if (hasKeywordMatch) {
    return answer;
  }
  const cleaned = stripContextApology(answer);
  const guidance = buildGeneralGuidance(question);
  return `${cleaned ? `${cleaned}\n\n` : ''}${guidance}`.trim();
};

const IMPORTANT_TOPIC_TRIGGERS = [
  'important topic',
  'important topics',
  'important question',
  'important questions',
  'impornt topic',
  'impornt topics',
  'impornt question',
  'impornt questions',
];

const isImportantTopicQuestion = (question = '') => {
  const lower = question.toLowerCase();
  return IMPORTANT_TOPIC_TRIGGERS.some((trigger) => lower.includes(trigger));
};

const buildImportantTopicsList = (context, limit = 5) => {
  const cleanText = cleanContext(context);
  const sentences = cleanText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!sentences.length) return [];

  const ranked = scoreSentences(sentences)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit);

  return ranked.map((item, idx) => `${idx + 1}. ${truncate(item.sentence, 160)}`);
};

const prependImportantTopics = (answer, question, contextSnippet) => {
  if (!isImportantTopicQuestion(question)) {
    return answer;
  }

  const topics = buildImportantTopicsList(contextSnippet, 4);
  if (!topics.length) {
    return answer;
  }

  const cleanedAnswer = answer?.trim() ? `\n\n${answer.trim()}` : '';
  return `🔥 Important topics detected:\n${topics.join('\n')}${cleanedAnswer}`;
};

const readRecentUploads = async (limit = 5, studentId = null) => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(UPLOAD_DIR)
    .filter((file) => file.endsWith('.json'));

  const uploads = [];
  for (const file of files) {
    const filePath = path.join(UPLOAD_DIR, file);
    try {
      const raw = await readFileAsync(filePath, 'utf-8');
      const metadata = JSON.parse(raw);
      if (metadata?.id) {
        if (studentId && metadata.studentId && metadata.studentId !== studentId) {
          continue;
        }
        uploads.push(metadata);
      }
    } catch (err) {
      console.warn('Failed to load metadata file', filePath, err.message);
    }
  }

  return uploads
    .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
    .slice(0, limit);
};

const callOpenRouter = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error('OPENROUTER_API_KEY missing');
    err.response = { status: 503 }; // Service unavailable
    throw err;
  }

  const payload = {
    model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly study mentor. IMPORTANT: Always respond in English only. Prefer using the provided PDF excerpt, but if it does not contain the requested info, clearly say so and immediately offer actionable general study advice instead of refusing. Do not translate or use any other language.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'http://localhost:5173',
      },
    }
  );

  const message = response.data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error('OpenRouter returned an empty response');
  }

  return message;
};

const callGroq = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY missing');
    err.response = { status: 503 }; // Service unavailable
    throw err;
  }

  // Try multiple models in order (only currently available models)
  const models = [
    process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
  ];

  let lastError;
  for (const model of models) {
    try {
      const payload = {
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly study mentor. IMPORTANT: Always respond in English only. Prefer using the provided PDF excerpt, but if it does not contain the requested info, clearly say so and immediately offer actionable general study advice instead of refusing. Do not translate or use any other language.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const response = await axios.post(
        `${process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ClearPath/1.0',
          },
          timeout: 30000,
        }
      );

      const message = response.data?.choices?.[0]?.message?.content;
      if (!message) {
        throw new Error('Groq returned an empty response');
      }

      console.log(`✅ Groq model ${model} succeeded`);
      return message;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
      // Continue to next model
    }
  }

  // All models failed
  throw lastError || new Error('All Groq models failed');
};

exports.uploadPdf = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileId = path.parse(req.file.filename).name;
    const fileBuffer = await readFileAsync(req.file.path);
    const parsed = await pdfParse(fileBuffer);

    // Clean up extracted text - fix encoding issues
    let extractedText = parsed.text || '';
    // Remove corrupted characters and normalize whitespace
    extractedText = extractedText
      .replace(/[\u0080-\u009F]/g, '') // Remove control characters
      .replace(/[\uFFF0-\uFFFF]/g, '') // Remove invalid Unicode
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    await writeFileAsync(textPath(fileId), extractedText);

    const metadata = {
      id: fileId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
       studentId,
    };

    await writeFileAsync(metadataPath(fileId), JSON.stringify(metadata, null, 2));

    res.json({ success: true, fileId, metadata });
  } catch (error) {
    console.error('uploadPdf error', error);
    res.status(500).json({ success: false, message: 'Failed to upload PDF' });
  }
};

exports.analyzePdf = async (req, res) => {
  try {
    const { fileId, question, chatId, chatTitle } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    const textFile = textPath(fileId);
    if (!fs.existsSync(textFile)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    const metadata = await loadMetadata(fileId);
    const context = await readFileAsync(textFile, 'utf-8');
    const requestedQuestion = question?.trim()
      ? question.trim()
      : 'List important questions, chapter summary, and exam-ready revision bullets from this PDF.';
    const { snippet, hasKeywordMatch } = buildContextSnippet(context, requestedQuestion, 6000);
    const promptContext = hasKeywordMatch ? snippet : `${snippet}\n\n(The question may not match this PDF, so offer general study support.)`;
    const prompt = `Summarize key ideas from this PDF and answer the user question.

PDF excerpt:
"""
${promptContext}
"""

Instructions:
- Highlight the most exam-ready concepts/topics even if the exact phrase in the question is missing.
- If the request is broader than the excerpt, explain what the PDF *does* focus on and immediately provide actionable study advice tied to it.
- Do not apologize or say you lack context—always offer constructive guidance.

Question: ${requestedQuestion}`;

    let answer;
    
    try {
      answer = await callOpenRouter(prompt);
    } catch (err) {
      if (!shouldFallback(err)) {
        throw err;
      }

      console.warn('OpenRouter unavailable. Trying Groq.', err.response?.status);

      try {
        answer = await callGroq(prompt);
      } catch (groqErr) {
        if (!shouldFallback(groqErr)) {
          throw groqErr;
        }

        console.warn('All AI services unavailable. Using fallback summary.');
        const fallback = buildFallbackSummary(snippet, requestedQuestion);
        answer = `${fallback}${FALLBACK_NOTICE}`;
      }
    }

    const sanitizedAnswer = stripContextApology(answer);
    const withTopics = prependImportantTopics(sanitizedAnswer, requestedQuestion, snippet);
    const blendedAnswer = blendWithGeneralAdvice(withTopics, hasKeywordMatch, requestedQuestion);

    let persistence = null;
    const studentId = await resolveStudentId(req);
    if (studentId) {
      try {
        persistence = await persistChatEntry({
          studentId,
          fileId,
          fileName: metadata?.originalName || metadata?.storedName || '',
          chatId,
          question: requestedQuestion,
          answer: blendedAnswer,
          chatTitle,
        });
      } catch (persistErr) {
        console.error('Failed to persist analyze chat entry', persistErr);
      }
    }

    res.json({ success: true, answer: blendedAnswer, chat: persistence?.chat, entry: persistence?.entry });
  } catch (error) {
    console.error('❌ analyzePdf error:', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      apiError: error?.response?.data,
      stack: error?.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.askPdf = async (req, res) => {
  try {
    const { fileId, question, chatId, chatTitle } = req.body;
    if (!fileId || !question) {
      return res.status(400).json({ success: false, message: 'fileId and question are required' });
    }

    if (isSmallTalk(question)) {
      return res.json({
        success: true,
        answer: 'Hey! I focus on summarizing your PDFs. Upload one and ask about formulas, important questions, or revision tips to get tailored help.',
      });
    }

    const textFile = textPath(fileId);
    if (!fs.existsSync(textFile)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const metadata = await loadMetadata(fileId);
    const context = await readFileAsync(textFile, 'utf-8');
    const trimmedQuestion = question.trim();
    const { snippet, hasKeywordMatch } = buildContextSnippet(context, trimmedQuestion, 6000);
    const promptContext = hasKeywordMatch ? snippet : `${snippet}\n\n(The question may not match this PDF, so offer general study support.)`;
    const prompt = `Answer the question using only the context from this PDF.

PDF excerpt:
"""
${promptContext}
"""

Instructions:
- Infer the most relevant topics or answers the excerpt can support, even if the question is general.
- If the excerpt doesn't mention the exact phrase, state what it covers and connect it to helpful study actions.
- Never apologize or say you cannot answer—always provide the best possible guidance.

Question: ${trimmedQuestion}`;

    let answer;
    
    try {
      answer = await callOpenRouter(prompt);
    } catch (err) {
      if (!shouldFallback(err)) {
        throw err;
      }

      console.warn('OpenRouter unavailable. Trying Groq.', err.response?.status);

      try {
        answer = await callGroq(prompt);
      } catch (groqErr) {
        if (!shouldFallback(groqErr)) {
          throw groqErr;
        }

        console.warn('All AI services unavailable. Using fallback answer.');
        const fallback = buildFallbackAnswer(snippet, trimmedQuestion);
        answer = `${fallback}${FALLBACK_NOTICE}`;
      }
    }

    const sanitizedAnswer = stripContextApology(answer);
    const withTopics = prependImportantTopics(sanitizedAnswer, trimmedQuestion, snippet);
    const blendedAnswer = blendWithGeneralAdvice(withTopics, hasKeywordMatch, trimmedQuestion);

    let persistence = null;
    if (req.user?.id) {
      try {
        persistence = await persistChatEntry({
          studentId: req.user.id,
          fileId,
          fileName: metadata?.originalName || metadata?.storedName || '',
          chatId,
          question: trimmedQuestion,
          answer: blendedAnswer,
          chatTitle,
        });
      } catch (persistErr) {
        console.error('Failed to persist ask chat entry', persistErr);
      }
    }

    res.json({ success: true, answer: blendedAnswer, chat: persistence?.chat, entry: persistence?.entry });
  } catch (error) {
    console.error('askPdf error', error);
    res.status(500).json({ success: false, message: 'Failed to answer question' });
  }
};

exports.listRecentUploads = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const uploads = await readRecentUploads(5, studentId);
    res.json({ success: true, uploads });
  } catch (error) {
    console.error('listRecentUploads error', error);
    res.status(500).json({ success: false, message: 'Failed to load uploads' });
  }
};

exports.deleteUpload = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    const metaFile = metadataPath(fileId);
    let metadata = null;
    if (fs.existsSync(metaFile)) {
      const metadataRaw = await readFileAsync(metaFile, 'utf-8');
      metadata = JSON.parse(metadataRaw);
      if (metadata.studentId && metadata.studentId !== studentId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      safeUnlink(metaFile);
      safeUnlink(textPath(fileId));
      if (metadata.storedName) {
        safeUnlink(path.join(UPLOAD_DIR, metadata.storedName));
      }
    }

    await PdfChat.updateMany({ student_id: studentId, file_id: fileId }, { file_removed: true });

    const uploads = await readRecentUploads(5, studentId);
    res.json({ success: true, uploads });
  } catch (error) {
    console.error('deleteUpload error', error);
    res.status(500).json({ success: false, message: 'Failed to delete upload' });
  }
};

exports.listChats = async (req, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const chats = await PdfChat.find({ student_id: studentId })
      .sort({ last_interaction_at: -1, updated_at: -1 })
      .limit(30);

    res.json({ success: true, chats: chats.map(mapChatSummary).filter(Boolean) });
  } catch (error) {
    console.error('listChats error', error);
    res.status(500).json({ success: false, message: 'Failed to load chats' });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'chatId is required' });
    }

    const chat = await PdfChat.findOne({ _id: chatId, student_id: studentId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, chat: mapChatSummary(chat), entries: mapChatEntries(chat) });
  } catch (error) {
    console.error('getChatById error', error);
    res.status(500).json({ success: false, message: 'Failed to load chat history' });
  }
};

exports.getPdfMetadata = async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadataFile = metadataPath(fileId);
    const textFile = textPath(fileId);

    if (!fs.existsSync(metadataFile)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const metadataRaw = await readFileAsync(metadataFile, 'utf-8');
    const metadata = JSON.parse(metadataRaw);
    const text = fs.existsSync(textFile) ? await readFileAsync(textFile, 'utf-8') : '';

    res.json({ success: true, metadata, text });
  } catch (error) {
    console.error('getPdfMetadata error', error);
    res.status(500).json({ success: false, message: 'Failed to load metadata' });
  }
};

exports.listAllUploads = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query?.limit, 10);
    const limit = Number.isNaN(requestedLimit) ? 50 : Math.min(Math.max(requestedLimit, 5), 200);
    
    const uploads = await readRecentUploads(limit, null);
    console.log(`✅ listAllUploads: Found ${uploads.length} uploads`);
    res.json({ success: true, uploads });
  } catch (error) {
    console.error('❌ listAllUploads error', error);
    res.status(500).json({ success: false, message: 'Failed to load uploads' });
  }
};

exports.adminDeleteUpload = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    console.log(`🗑️ Attempting to delete upload: ${fileId}`);

    const metaFile = metadataPath(fileId);
    let found = false;

    if (fs.existsSync(metaFile)) {
      found = true;
      let metadata = null;
      try {
        const raw = await readFileAsync(metaFile, 'utf-8');
        metadata = JSON.parse(raw);
        console.log(`✅ Deleting metadata file: ${metaFile}`);
        safeUnlink(metaFile);
        if (metadata?.storedName) {
          const pdfPath = path.join(UPLOAD_DIR, metadata.storedName);
          console.log(`✅ Deleting PDF file: ${pdfPath}`);
          safeUnlink(pdfPath);
        }
      } catch (err) {
        console.warn('Failed to parse metadata for admin delete', fileId, err.message);
        safeUnlink(metaFile);
      }
    }

    const textFile = textPath(fileId);
    if (fs.existsSync(textFile)) {
      found = true;
      console.log(`✅ Deleting text file: ${textFile}`);
      safeUnlink(textFile);
    }

    if (!found) {
      console.warn(`⚠️ File not found for deletion: ${fileId}`);
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    await PdfChat.updateMany({ file_id: fileId }, { file_removed: true });

    const uploads = await readRecentUploads(50, null);
    console.log(`✅ Delete successful. Remaining uploads: ${uploads.length}`);
    res.json({ success: true, uploads });
  } catch (error) {
    console.error('❌ adminDeleteUpload error', error);
    res.status(500).json({ success: false, message: 'Failed to delete upload' });
  }
};
