const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  voterName: { type: String, required: true },
  votes: [{
    optionId: { type: String, required: true },
    points: { type: Number, required: true }
  }],
}, { timestamps: true });

// Ensure one vote per person per poll
VoteSchema.index({ pollId: 1, voterName: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
