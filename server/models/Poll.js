const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  question: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  votingMode: { type: String, enum: ['single', 'weighted'], required: true },
  pointsPerUser: { type: Number, default: 10 },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);
