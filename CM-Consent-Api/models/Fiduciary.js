const mongoose = require('mongoose');

const fiduciarySchema = new mongoose.Schema({
  fiduciaryId: { type: String, unique: true, required: true },
  companyName: { type: String, required: true },
  dataRequested: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Fiduciary', fiduciarySchema);
