const express = require('express');
const router = express.Router({ mergeParams: true });
const Poll = require('../models/Poll');

router.get('/active', async (req, res) => {
  try {
    const poll = await Poll.findOne({ roomId: req.params.roomId, status: 'active' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
