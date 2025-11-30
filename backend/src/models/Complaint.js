const mongoose = require('../config/db');

const complaintSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    category: { type: String },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    staff_response: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const ComplaintModel = mongoose.model('Complaint', complaintSchema);

const Complaint = {
  async create({ studentId, title, category, description, priority }) {
    const doc = await ComplaintModel.create({
      student_id: studentId,
      title,
      category,
      description,
      priority: priority || 'Medium',
      status: 'Pending',
    });
    return doc.toObject();
  },

  async findById(id) {
    const doc = await ComplaintModel.findById(id).lean();
    return doc || null;
  },

  async findByStudent(studentId) {
    if (!studentId) {
      return [];
    }
    const docs = await ComplaintModel.find({ student_id: studentId })
      .sort({ created_at: -1 })
      .lean();
    return docs;
  },

  async findAll() {
    const docs = await ComplaintModel.find().sort({ created_at: -1 }).lean();
    return docs;
  },

  async updateStatusAndResponse(id, { status, staffResponse }) {
    await ComplaintModel.findByIdAndUpdate(id, {
      status,
      staff_response: staffResponse,
    });
  },

  async deleteById(id) {
    await ComplaintModel.findByIdAndDelete(id);
  },

  async getStudentRoster(limit = 6) {
    const roster = await ComplaintModel.aggregate([
      { $sort: { updated_at: -1 } },
      {
        $group: {
          _id: '$student_id',
          ticketCount: { $sum: 1 },
          latestStatus: { $first: '$status' },
          latestCategory: { $first: '$category' },
          latestTitle: { $first: '$title' },
          latestUpdatedAt: { $first: '$updated_at' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          name: '$student.name',
          ticketCount: 1,
          latestStatus: 1,
          latestCategory: 1,
          latestTitle: 1,
          latestUpdatedAt: 1,
        },
      },
      { $sort: { ticketCount: -1, latestUpdatedAt: -1 } },
      { $limit: limit },
    ]);

    return roster.map((entry) => ({
      studentId: entry.studentId?.toString?.() || '',
      name: entry.name || 'Student',
      ticketCount: entry.ticketCount || 0,
      latestStatus: entry.latestStatus || 'Pending',
      latestCategory: entry.latestCategory || 'General',
      latestTitle: entry.latestTitle || '',
      latestUpdatedAt: entry.latestUpdatedAt,
    }));
  },
};

module.exports = Complaint;
