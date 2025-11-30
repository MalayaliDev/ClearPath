const mongoose = require('../config/db');

const entrySchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pdfChatSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    file_id: { type: String, required: true },
    file_name: { type: String },
    title: { type: String, required: true },
    preview: { type: String },
    message_count: { type: Number, default: 0 },
    last_interaction_at: { type: Date, default: Date.now },
    file_removed: { type: Boolean, default: false },
    entries: {
      type: [entrySchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('PdfChat', pdfChatSchema);
