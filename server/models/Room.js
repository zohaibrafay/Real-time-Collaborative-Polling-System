const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  presenterId: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'active', 'closed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
