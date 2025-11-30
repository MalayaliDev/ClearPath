const mongoose = require('../config/db');

const ticketMessageSchema = new mongoose.Schema(
  {
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    sender_type: { type: String, enum: ['student', 'staff'], required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('TicketMessage', ticketMessageSchema);
