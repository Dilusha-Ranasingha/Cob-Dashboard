const mongoose = require('mongoose');

const cobSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  durationText: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Cob', cobSchema);