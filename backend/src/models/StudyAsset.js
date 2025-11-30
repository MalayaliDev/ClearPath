const mongoose = require('../config/db');

const studyAssetSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    source_type: { type: String, enum: ['pdf', 'text', 'link'], default: 'text' },
    source_reference: { type: String, default: '' },
    content: { type: String, required: true },
    content_preview: { type: String, default: '' },
    word_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('StudyAsset', studyAssetSchema);
