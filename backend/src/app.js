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

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://clear-path-two.vercel.app',
];

// *** FIXED CORS CONFIG ***
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200,
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight handler

app.use(express.json());
app.use(cookieParser());

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Brototype Complaints API running' });
});

// Static uploads
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/study', studyRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
