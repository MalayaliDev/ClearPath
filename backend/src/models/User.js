const mongoose = require('../config/db');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
    phone_encrypted: { type: String, default: '' },
    phone_masked: { type: String, default: '' },
    discord_webhook_encrypted: { type: String, default: '' },
    discord_webhook_masked: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const UserModel = mongoose.model('User', userSchema);

const User = {
  async create({ name, email, passwordHash, role }) {
    const doc = await UserModel.create({ name, email, password_hash: passwordHash, role });
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      phone_masked: doc.phone_masked,
      discord_webhook_masked: doc.discord_webhook_masked,
    };
  },

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).lean();
    if (!doc) return null;
    return doc;
  },

  async findById(id) {
    const doc = await UserModel.findById(id)
      .select('name email role created_at')
      .lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      created_at: doc.created_at,
      phone_masked: doc.phone_masked,
    };
  },

  async findByName(name) {
    if (!name) return null;
    const doc = await UserModel.findOne({ name })
      .select('name email role created_at')
      .lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      created_at: doc.created_at,
      phone_masked: doc.phone_masked,
    };
  },

  async updatePhone(id, { encrypted, masked }) {
    await UserModel.findByIdAndUpdate(id, {
      phone_encrypted: encrypted,
      phone_masked: masked,
    });
  },

  async getMaskedPhone(id) {
    const doc = await UserModel.findById(id).select('phone_masked').lean();
    return doc?.phone_masked || '';
  },

  async updateDiscordWebhook(id, { encrypted, masked }) {
    await UserModel.findByIdAndUpdate(id, {
      discord_webhook_encrypted: encrypted,
      discord_webhook_masked: masked,
    });
  },

  async getDiscordWebhookMasked(id) {
    const doc = await UserModel.findById(id).select('discord_webhook_masked').lean();
    return doc?.discord_webhook_masked || '';
  },

  async findAll() {
    const docs = await UserModel.find({})
      .select('_id name email role created_at')
      .lean();
    return docs.map((doc) => {
      console.log('Processing user doc:', doc);
      return {
        id: doc._id?.toString() || '',
        name: doc.name || '',
        email: doc.email || '',
        role: doc.role || 'student',
        createdAt: doc.created_at || new Date().toISOString(),
      };
    });
  },

  async deleteMany(query) {
    const result = await UserModel.deleteMany(query);
    return result;
  },
};

module.exports = User;
