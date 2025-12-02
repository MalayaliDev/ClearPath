const axios = require('axios');

const REQUEST_TIMEOUT = Number(process.env.OPENROUTER_TIMEOUT_MS || 15000);

const resolveStudentId = (req) => (req?.user?.id ? req.user.id : null);

const sanitizeHistory = (history = []) =>
  history
    .filter(
      (entry) =>
        entry &&
        typeof entry.content === 'string' &&
        entry.content.trim().length &&
        ['assistant', 'user'].includes(entry.role)
    )
    .slice(-12)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 2000),
    }));

const summarizeAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.slice(0, 2).map((file, index) => {
    const name = String(file?.name || `attachment-${index + 1}`);
    const type = file?.type || 'file';
    const size = file?.size ? `${Math.round(Number(file.size) / 1024)}KB` : '';
    const note = file?.note || '';
    const preview = typeof file?.preview === 'string' ? file.preview.slice(0, 4000) : '';

    return [
      `Attachment ${index + 1}: ${name}${type ? ` (${type})` : ''}${size ? ` - ${size}` : ''}`,
      note ? `Note: ${note}` : null,
      preview ? `Preview (truncated):\n${preview}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  });
};

const callOpenRouter = async (messages) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY missing');
  }

  const payload = {
    model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
    messages,
  };

  const response = await axios.post(
    `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
    payload,
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
    throw new Error('OpenRouter returned an empty response');
  }

  return message;
};

exports.chatWithMentor = async (req, res) => {
  try {
    console.log('chatWithMentor called, req.user:', req.user);
    const studentId = await resolveStudentId(req);
    if (!studentId) {
      console.warn('chatWithMentor: No student ID');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { history = [], prompt, attachments = [] } = req.body;
    console.log('Mentor chat request - prompt length:', prompt?.length, 'history length:', history?.length);
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const systemRule = `You are Mentor Lab, a friendly accountability partner. Always greet the student by name if available.
Tonight's agenda:
- Coach the student with short, upbeat steps.
- Reference complaints or PDFs when provided in the conversation history.
- If the student says "hi", greet them back warmly and ask what they are working on.
- Keep responses under 200 words, using numbered steps or short paragraphs.`;

    const sanitizedHistory = sanitizeHistory(history);
    const attachmentNotes = summarizeAttachments(attachments);
    const userContent = attachmentNotes.length
      ? `${prompt.trim()}\n\nAttachment context:\n${attachmentNotes.join('\n\n')}`
      : prompt.trim();

    const messages = [
      { role: 'system', content: systemRule },
      ...sanitizedHistory,
      { role: 'user', content: userContent },
    ];

    let answer;
    try {
      answer = await callOpenRouter(messages);
    } catch (error) {
      console.error('MentorLab OpenRouter error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }

    res.json({ success: true, reply: answer });
  } catch (error) {
    console.error('chatWithMentor error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    res.status(500).json({ success: false, message: 'Failed to generate mentor reply' });
  }
};
