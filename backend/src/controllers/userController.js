const axios = require('axios');
const User = require('../models/User');
const { encode } = require('../utils/phoneCrypto');
const { encodeSecret } = require('../utils/secretCrypto');

const normalizePhone = (raw = '') => {
  const digits = raw.replace(/\D+/g, '');
  if (!digits.length) return '';
  if (digits.length < 10) {
    throw new Error('Phone must be at least 10 digits');
  }
  return digits.startsWith('0') ? digits.slice(1) : digits;
};

const sendDiscordTest = async (webhookUrl, studentName = '') => {
  const content = `✅ Planner Lab connected. Hi ${studentName || 'there'}! This is a test ping to confirm Discord reminders are active.`;
  await axios.post(webhookUrl, { content }, { timeout: 5000 });
};

const validateDiscordWebhook = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (!host.endsWith('discord.com') && !host.endsWith('discordapp.com')) {
      return false;
    }
    return parsed.pathname.includes('/api/webhooks/');
  } catch (err) {
    return false;
  }
};

exports.savePhoneNumber = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let normalized;
    try {
      normalized = normalizePhone(phone);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const { encrypted, masked } = encode(normalized);
    await User.updatePhone(req.user.id, { encrypted, masked });

    res.json({ success: true, masked });
  } catch (error) {
    console.error('savePhoneNumber error', error);
    res.status(500).json({ success: false, message: 'Failed to save phone number' });
  }
};

exports.getPhoneNumber = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const masked = await User.getMaskedPhone(req.user.id);
    res.json({ success: true, masked });
  } catch (error) {
    console.error('getPhoneNumber error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch phone number' });
  }
};

exports.saveDiscordWebhook = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { webhook } = req.body;
    if (!webhook || !validateDiscordWebhook(webhook)) {
      return res.status(400).json({ success: false, message: 'Provide a valid Discord webhook URL.' });
    }

    const { encrypted, masked } = encodeSecret(webhook.trim());
    try {
      await sendDiscordTest(webhook.trim(), req.user?.name);
    } catch (err) {
      console.error('Discord webhook test failed', err.response?.data || err.message);
      return res.status(400).json({ success: false, message: 'Discord rejected the webhook. Please verify the URL and channel permissions.' });
    }

    await User.updateDiscordWebhook(req.user.id, { encrypted, masked });

    res.json({ success: true, masked });
  } catch (error) {
    console.error('saveDiscordWebhook error', error);
    res.status(500).json({ success: false, message: 'Failed to save Discord webhook' });
  }
};

exports.getDiscordWebhook = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const masked = await User.getDiscordWebhookMasked(req.user.id);
    res.json({ success: true, masked });
  } catch (error) {
    console.error('getDiscordWebhook error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Discord webhook' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called, user:', req.user);
    
    if (!req.user?.id) {
      console.warn('getAllUsers: No user ID');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('Fetching all users from database...');
    const users = await User.findAll();
    console.log('Found users:', users.length);
    console.log('Raw users data:', JSON.stringify(users, null, 2));
    
    if (!users || users.length === 0) {
      console.warn('No users found in database');
      return res.json({ success: true, users: [] });
    }
    
    const formattedUsers = users.map((user) => {
      const formatted = {
        id: user.id || '',
        name: (user.name && user.name.trim()) ? user.name : (user.email || 'Unknown User'),
        email: user.email || '',
        role: user.role || 'student',
        createdAt: user.createdAt,
        banned: false,
        blacklisted: false,
      };
      console.log('Formatted user:', formatted);
      return formatted;
    });

    console.log('Returning formatted users count:', formattedUsers.length);
    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('getAllUsers error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

exports.deleteMultipleUsers = async (req, res) => {
  try {
    console.log('deleteMultipleUsers called, user:', req.user);
    
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }

    console.log('Deleting users:', userIds);
    
    // Delete users from database
    const mongoose = require('../config/db');
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password_hash: { type: String, required: true },
      role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
      phone_encrypted: { type: String, default: '' },
      phone_masked: { type: String, default: '' },
      discord_webhook_encrypted: { type: String, default: '' },
      discord_webhook_masked: { type: String, default: '' },
    }, { timestamps: { createdAt: 'created_at', updatedAt: false } });
    
    const UserModel = mongoose.model('User', userSchema);
    const result = await UserModel.deleteMany({ _id: { $in: userIds } });
    
    console.log('Deleted users count:', result.deletedCount);
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} user(s)`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('deleteMultipleUsers error', error);
    res.status(500).json({ success: false, message: 'Failed to delete users', error: error.message });
  }
};
