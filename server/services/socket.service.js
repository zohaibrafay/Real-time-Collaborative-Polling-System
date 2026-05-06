const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

// Calculate results utility
const getPollResults = async (pollId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) return null;

  const votes = await Vote.find({ pollId });
  const results = {};
  poll.options.forEach(opt => {
    results[opt.id] = 0;
  });

  let totalVotes = 0;
  votes.forEach(v => {
    totalVotes += 1;
    v.votes.forEach(vp => {
      if (results[vp.optionId] !== undefined) {
        results[vp.optionId] += vp.points;
      }
    });
  });

  return { results, totalVoters: totalVotes };
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Presenter or Audience joins a room
    socket.on('join_room', ({ roomCode }) => {
      const code = roomCode.toUpperCase();
      socket.join(code);
      console.log(`Socket ${socket.id} joined room ${code}`);
    });

    // Presenter launches a poll
    socket.on('launch_poll', async ({ roomCode, roomId, presenterId, question, options, votingMode, pointsPerUser }) => {
      const code = roomCode.toUpperCase();
      
      // Validate presenter
      const room = await require('../models/Room').findById(roomId);
      if (!room || room.presenterId !== presenterId) {
        return socket.emit('error', { message: 'Unauthorized: Only the presenter can launch polls' });
      }

      // Close any currently active poll for this room
      await Poll.updateMany({ roomId, status: 'active' }, { status: 'closed' });
      
      // Create new poll
      const poll = new Poll({
        roomId,
        question,
        options,
        votingMode,
        pointsPerUser
      });
      await poll.save();

      // Broadcast new poll to room
      io.to(code).emit('poll_active', poll);
      
      // Send initial empty results to presenter
      const results = await getPollResults(poll._id);
      io.to(code).emit('poll_results', { pollId: poll._id, ...results });
    });

    // Audience submits a vote
    socket.on('submit_vote', async ({ roomCode, roomId, pollId, voterName, votes }) => {
      const code = roomCode.toUpperCase();
      
      try {
        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== 'active') {
          socket.emit('vote_error', { message: 'Poll is not active' });
          return;
        }

        // Validate voting mode points
        if (poll.votingMode === 'single') {
          if (votes.length !== 1 || votes[0].points !== 1) {
            socket.emit('vote_error', { message: 'Invalid vote for single choice' });
            return;
          }
        } else if (poll.votingMode === 'weighted') {
          const totalPoints = votes.reduce((sum, v) => sum + v.points, 0);
          if (totalPoints !== poll.pointsPerUser) {
            socket.emit('vote_error', { message: `Points must exactly equal ${poll.pointsPerUser}` });
            return;
          }
        }

        // Upsert the vote
        await Vote.findOneAndUpdate(
          { pollId, voterName },
          { roomId, votes },
          { upsert: true, new: true }
        );

        // Broadcast updated results to the room
        const results = await getPollResults(pollId);
        io.to(code).emit('poll_results', { pollId, ...results });
        
        socket.emit('vote_success', { message: 'Vote recorded' });
        
      } catch (err) {
        console.error('Vote error:', err);
        socket.emit('vote_error', { message: err.message });
      }
    });

    // Presenter closes a poll
    socket.on('close_poll', async ({ roomCode, pollId, presenterId }) => {
      const code = roomCode.toUpperCase();
      
      const poll = await Poll.findById(pollId);
      if (!poll) return;

      // Validate presenter
      const room = await require('../models/Room').findById(poll.roomId);
      if (!room || room.presenterId !== presenterId) {
        return socket.emit('error', { message: 'Unauthorized: Only the presenter can close polls' });
      }

      const updatedPoll = await Poll.findByIdAndUpdate(pollId, { status: 'closed' }, { new: true });
      
      if (updatedPoll) {
        io.to(code).emit('poll_closed', updatedPoll);
        const results = await getPollResults(pollId);
        io.to(code).emit('poll_results', { pollId, ...results, final: true });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;
