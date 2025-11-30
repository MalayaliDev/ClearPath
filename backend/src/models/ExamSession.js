const mongoose = require('../config/db');

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: 'Each question must include at least two options.',
      },
      required: true,
    },
    answer_index: { type: Number, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    selected_index: { type: Number, required: true },
    is_correct: { type: Boolean, default: false },
  },
  { _id: false }
);

const examSessionSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    file_id: { type: String, required: true },
    file_name: { type: String, default: '' },
    question_count: { type: Number, required: true },
    questions: { type: [questionSchema], default: [] },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
    completed_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('ExamSession', examSessionSchema);
