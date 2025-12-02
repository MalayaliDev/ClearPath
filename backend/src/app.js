const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const studyRoutes = require('./routes/studyRoutes');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://clear-path-two.vercel.app',
];

// ============================================
// CORS MIDDLEWARE - MUST BE FIRST
// ============================================
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Brototype Complaints API running' });
});

app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/study', studyRoutes);

// ============================================
// ERROR HANDLER - MUST ALSO SEND CORS HEADERS
// ============================================
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://clear-path-two.vercel.app',
  ];
  
  // Send CORS headers even on error
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
