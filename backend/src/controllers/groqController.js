const axios = require('axios');

const REQUEST_TIMEOUT = Number(process.env.GROQ_TIMEOUT_MS || 15000);

const callGroqAPI = async (messages, maxTokens = 250) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  const payload = {
    model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
  };

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    payload,
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
    throw new Error('GROQ returned an empty response');
  }

  return message;
};

exports.chatWithJarvis = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Jarvis Chat Request:', { message, hasApiKey: !!process.env.GROQ_API_KEY });

    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured, using mock response');
      const mockResponse = `I understand you're asking about "${message}". As Jarvis, I'm here to help you with your studies. Could you provide more details?`;
      return res.json({
        response: mockResponse,
        model: 'mock',
        warning: 'GROQ_API_KEY not configured',
      });
    }

    const aiResponse = await callGroqAPI([
      {
        role: 'system',
        content: `You are Jarvis, a voice assistant for students made by Malayali Dev. Keep responses SHORT (2-3 sentences max). Be concise, friendly, and helpful. Answer directly without extra details. If asked who made you, mention Malayali Dev.`,
      },
      { role: 'user', content: message },
    ], 150);

    console.log('GROQ Response received:', { length: aiResponse.length });

    res.json({
      response: aiResponse,
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    });
  } catch (error) {
    console.error('GROQ API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    const mockResponse = `I understand you're asking about "${req.body.message}". As Jarvis, I'm here to help you with your studies.`;

    res.json({
      response: mockResponse,
      model: 'mock-fallback',
      error: error.message,
    });
  }
};

exports.analyzeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.body.type || 'file';
    console.log('File Analysis Request:', { filename: req.file.originalname, type: fileType });

    if (!process.env.GROQ_API_KEY) {
      const mockAnalysis = `I've reviewed the ${fileType} file "${req.file.originalname}". This appears to be an educational resource. To provide detailed analysis, please configure the GROQ API key.`;
      return res.json({ analysis: mockAnalysis });
    }

    const analysis = await callGroqAPI([
      {
        role: 'system',
        content: `You are Jarvis, an AI assistant helping students. Analyze the uploaded ${fileType} file and provide: 1) Brief summary, 2) Key concepts, 3) Difficulty level, 4) Study approach. Keep responses concise and conversational for voice output.`,
      },
      {
        role: 'user',
        content: `Please analyze this ${fileType} file: ${req.file.originalname}`,
      },
    ]);

    console.log('File Analysis completed:', { filename: req.file.originalname });

    res.json({
      analysis: analysis,
      filename: req.file.originalname,
      type: fileType,
    });
  } catch (error) {
    console.error('File Analysis Error:', error.message);

    const mockAnalysis = `I've received your file. While I couldn't perform detailed analysis right now, I can help you study this material. What specific topics would you like to focus on?`;

    res.json({
      analysis: mockAnalysis,
      filename: req.file?.originalname || 'unknown',
      error: error.message,
    });
  }
};
