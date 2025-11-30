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
