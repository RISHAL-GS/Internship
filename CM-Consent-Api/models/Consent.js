const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  consentId: { type: String, unique: true, required: true },
  fiduciaryId: { type: String, required: true },
  agreedConsents: [{ type: String }],
  nonAgreedConsents: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  lastUpdated: { type: Date },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  logs: [
    {
      action: String,
      details: Object,
      at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Consent', consentSchema);
