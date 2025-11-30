 const crypto = require('crypto');

const deriveKey = () => {
  const secret = process.env.SECRET_CIPHER_KEY || 'fallback-secret-key-change-me';
  return crypto.createHash('sha256').update(secret).digest();
};

const encodeSecret = (plain = '') => {
  if (!plain) {
    return { encrypted: '', masked: '' };
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const payload = `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  const masked = maskSecret(plain);
  return { encrypted: payload, masked };
};

const decodeSecret = (payload = '') => {
  if (!payload) return '';
  const [ivHex, dataHex] = payload.split(':');
  if (!ivHex || !dataHex) return '';
  const decipher = crypto.createDecipheriv('aes-256-ctr', deriveKey(), Buffer.from(ivHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
};

const maskSecret = (secret = '') => {
  if (!secret) return '';
  if (secret.length <= 8) return '*'.repeat(secret.length);
  const start = secret.slice(0, 6);
  const end = secret.slice(-4);
  return `${start}…${end}`;
};

module.exports = { encodeSecret, decodeSecret, maskSecret };
