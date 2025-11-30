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

// CORS FIRST - before any other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always send CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Then body parsers
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
