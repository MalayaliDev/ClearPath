const mongoose = require('../config/db');

const cardSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: [(val) => Array.isArray(val) && val.length >= 2, 'Each quiz question needs at least two options'],
      required: true,
    },
    answer_index: { type: Number, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    selected_index: { type: Number, default: -1 },
    is_correct: { type: Boolean, default: false },
  },
  { _id: false }
);

const studyDeckSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    asset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyAsset', required: true },
    type: { type: String, enum: ['flashcards', 'quiz'], required: true },
    title: { type: String, required: true },
    settings: {
      count: { type: Number, default: 10 },
    },
    cards: { type: [cardSchema], default: [] },
    questions: { type: [quizQuestionSchema], default: [] },
    responses: { type: [responseSchema], default: [] },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('StudyDeck', studyDeckSchema);
