const mongoose = require('../config/db');

const DEFAULT_CONFIG = {
  autopilot: true,
  requireFiles: false,
  maxOpen: 5,
  autoCloseHours: 72,
  routing: 'mentor',
  automations: {
    kb: true,
    mentor: true,
    ops: false,
  },
};

const staffConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    autopilot: { type: Boolean, default: DEFAULT_CONFIG.autopilot },
    requireFiles: { type: Boolean, default: DEFAULT_CONFIG.requireFiles },
    maxOpen: { type: Number, default: DEFAULT_CONFIG.maxOpen },
    autoCloseHours: { type: Number, default: DEFAULT_CONFIG.autoCloseHours },
    routing: { type: String, default: DEFAULT_CONFIG.routing },
    automations: {
      kb: { type: Boolean, default: DEFAULT_CONFIG.automations.kb },
      mentor: { type: Boolean, default: DEFAULT_CONFIG.automations.mentor },
      ops: { type: Boolean, default: DEFAULT_CONFIG.automations.ops },
    },
    updated_at: { type: Date, default: Date.now },
  },
  { minimize: false }
);

const StaffConfigModel = mongoose.model('StaffConfig', staffConfigSchema);

async function ensureConfig() {
  const existing = await StaffConfigModel.findById('singleton').lean();
  if (existing) {
    return existing;
  }
  const created = await StaffConfigModel.create({ _id: 'singleton', ...DEFAULT_CONFIG });
  return created.toObject();
}

const StaffConfig = {
  async getConfig() {
    return ensureConfig();
  },

  async updateConfig(patch = {}) {
    const next = {
      ...patch,
      automations: {
        kb: patch?.automations?.kb ?? undefined,
        mentor: patch?.automations?.mentor ?? undefined,
        ops: patch?.automations?.ops ?? undefined,
      },
    };

    const sanitized = {
      ...(typeof patch.autopilot === 'boolean' ? { autopilot: patch.autopilot } : {}),
      ...(typeof patch.requireFiles === 'boolean' ? { requireFiles: patch.requireFiles } : {}),
      ...(Number.isFinite(patch.maxOpen) ? { maxOpen: Math.max(1, Math.min(10, Number(patch.maxOpen))) } : {}),
      ...(Number.isFinite(patch.autoCloseHours)
        ? { autoCloseHours: Math.max(1, Math.min(168, Number(patch.autoCloseHours))) }
        : {}),
      ...(typeof patch.routing === 'string' ? { routing: patch.routing } : {}),
    };

    if (patch.automations) {
      sanitized.automations = {
        ...(typeof patch.automations.kb === 'boolean' ? { 'automations.kb': patch.automations.kb } : {}),
        ...(typeof patch.automations.mentor === 'boolean' ? { 'automations.mentor': patch.automations.mentor } : {}),
        ...(typeof patch.automations.ops === 'boolean' ? { 'automations.ops': patch.automations.ops } : {}),
      };
    }

    const flattened = { ...sanitized };
    if (sanitized.automations) {
      Object.entries(sanitized.automations).forEach(([key, value]) => {
        flattened[key] = value;
      });
      delete flattened.automations;
    }

    const updated = await StaffConfigModel.findByIdAndUpdate(
      'singleton',
      { $set: { ...flattened, updated_at: new Date() } },
      { new: true, upsert: true }
    ).lean();

    return updated;
  },
};

module.exports = StaffConfig;
