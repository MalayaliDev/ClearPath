const express = require('express');
const Complaint = require('../models/Complaint');
const TicketMessage = require('../models/TicketMessage');
const auth = require('../middleware/auth');

const router = express.Router();

router.param('id', async (req, res, next, id) => {
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    req.complaintDoc = complaint;
    return next();
  } catch (error) {
    console.error('complaint param error', error);
    return res.status(500).json({ message: 'Failed to load ticket' });
  }
});

router.post('/', auth(['student']), async (req, res) => {
  try {
    const { title, category, description, priority } = req.body;
    const complaint = await Complaint.create({
      studentId: req.user.id,
      title,
      category,
      description,
      priority: priority || 'Medium',
    });
    if (description && description.trim()) {
      try {
        await TicketMessage.create({
          complaint_id: complaint._id,
          sender_type: 'student',
          sender_id: req.user.id,
          body: description.trim(),
        });
      } catch (messageErr) {
        console.error('Failed to log initial ticket message', messageErr);
      }
    }
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create complaint' });
  }
});

router.get('/my', auth(['student']), async (req, res) => {
  try {
    const complaints = await Complaint.findByStudent(req.user.id);
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load complaints' });
  }
});

router.get('/', auth(['staff', 'admin']), async (req, res) => {
  try {
    const complaints = await Complaint.findAll();
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load complaints' });
  }
});

router.get('/roster', auth(['student', 'staff', 'admin']), async (req, res) => {
  try {
    const roster = await Complaint.getStudentRoster(8);
    res.json(roster);
  } catch (error) {
    console.error('failed to load roster', error);
    res.status(500).json({ message: 'Failed to load student roster' });
  }
});

router.patch('/:id', auth(['staff', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffResponse } = req.body;
    await Complaint.updateStatusAndResponse(id, { status, staffResponse });
    res.json({ message: 'Complaint updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
});

router.delete('/:id', auth(['staff', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.deleteById(id);
    await TicketMessage.deleteMany({ complaint_id: id });
    res.json({ message: 'Complaint deleted' });
  } catch (error) {
    console.error('delete complaint error', error);
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
});

const canAccessComplaint = (complaint, user) => {
  if (!complaint || !user) return false;
  const isStaff = user.role === 'staff' || user.role === 'admin';
  if (isStaff) return true;
  return complaint.student_id?.toString() === user.id;
};

router.get('/:id', auth(['student', 'staff', 'admin']), async (req, res) => {
  try {
    const { complaintDoc } = req;
    if (!canAccessComplaint(complaintDoc, req.user)) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(complaintDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load ticket' });
  }
});

router.get('/:id/messages', auth(['student', 'staff', 'admin']), async (req, res) => {
  try {
    const { complaintDoc } = req;
    if (!canAccessComplaint(complaintDoc, req.user)) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const filters = { complaint_id: complaintDoc._id };
    if (before && !Number.isNaN(before.getTime())) {
      filters.created_at = { $lt: before };
    }

    const rawMessages = await TicketMessage.find(filters).sort({ created_at: -1 }).limit(limit).lean();
    const hasMore = rawMessages.length === limit;
    const messages = [...rawMessages].reverse();
    const nextCursor = hasMore && messages.length ? messages[0].created_at : null;

    res.json({ messages, hasMore, nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load ticket messages' });
  }
});

router.post('/:id/messages', auth(['student', 'staff', 'admin']), async (req, res) => {
  try {
    const { body } = req.body || {};
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Message body is required' });
    }

    const { complaintDoc } = req;
    if (!canAccessComplaint(complaintDoc, req.user)) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const senderType = req.user.role === 'student' ? 'student' : 'staff';
    const message = await TicketMessage.create({
      complaint_id: complaintDoc._id,
      sender_type: senderType,
      sender_id: req.user.id,
      body: body.trim(),
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send ticket message' });
  }
});

module.exports = router;
