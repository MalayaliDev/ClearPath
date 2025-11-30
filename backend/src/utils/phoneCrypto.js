const crypto = require('crypto');

const deriveKey = () => {
  const secret = process.env.PHONE_CIPHER_KEY || 'fallback-key-do-not-use-in-prod';
  return crypto.createHash('sha256').update(secret).digest();
};

const encode = (plain) => {
  if (!plain) return { encrypted: '', masked: '' };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const encryptedPayload = `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  return { encrypted: encryptedPayload, masked: mask(plain) };
};

const decode = (encryptedPayload) => {
  if (!encryptedPayload) return '';
  const [ivHex, dataHex] = encryptedPayload.split(':');
  if (!ivHex || !dataHex) return '';
  const decipher = crypto.createDecipheriv('aes-256-ctr', deriveKey(), Buffer.from(ivHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
};

const mask = (phone) => {
  const digits = phone.replace(/\D+/g, '');
  if (digits.length <= 4) {
    return digits.replace(/\d/g, '*');
  }
  const last4 = digits.slice(-4);
  return `+***-****-${last4}`;
};

module.exports = { encode, decode, mask };
