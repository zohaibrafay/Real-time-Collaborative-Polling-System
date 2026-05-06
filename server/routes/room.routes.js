const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.post('/', async (req, res) => {
  try {
    const code = generateRoomCode();
    // Generate a random token to identify the presenter
    const presenterId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const room = new Room({ code, presenterId });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
