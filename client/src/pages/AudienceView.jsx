import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import VotingInterface from '../components/VotingInterface';
import LiveResults from '../components/LiveResults';

export default function AudienceView() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(sessionStorage.getItem('displayName'));
  const [activePoll, setActivePoll] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [totalVoters, setTotalVoters] = useState(0);

  useEffect(() => {
    if (!displayName) {
      navigate('/');
      return;
    }

    // Fetch room
    fetch(`http://localhost:3001/api/rooms/${roomCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          navigate('/');
        } else {
          setRoomData(data);
          socket.emit('join_room', { roomCode });
          
          fetch(`http://localhost:3001/api/rooms/${data._id}/polls/active`)
            .then(res => res.json())
            .then(poll => {
              if (poll && !poll.error) {
                setActivePoll(poll);
              }
            });
        }
      });

    const handlePollActive = (poll) => {
      setActivePoll(poll);
      setSubmitted(false);
      setPollResults(null);
    };

    const handlePollResults = (data) => {
      setActivePoll(prev => {
        if (prev && data.pollId === prev._id) {
          if (data.final) {
            setPollResults(data.results);
            setTotalVoters(data.totalVoters);
            return { ...prev, status: 'closed' };
          }
        }
        return prev;
      });
    };

    const handlePollClosed = (poll) => {
      setActivePoll(poll);
    };

    const handleVoteSuccess = () => {
      setSubmitted(true);
    };

    const handleVoteError = (err) => {
      alert(err.message);
    };

    socket.on('poll_active', handlePollActive);
    socket.on('poll_results', handlePollResults);
    socket.on('poll_closed', handlePollClosed);
    socket.on('vote_success', handleVoteSuccess);
    socket.on('vote_error', handleVoteError);

    return () => {
      socket.off('poll_active', handlePollActive);
      socket.off('poll_results', handlePollResults);
      socket.off('poll_closed', handlePollClosed);
      socket.off('vote_success', handleVoteSuccess);
      socket.off('vote_error', handleVoteError);
    };
  }, [roomCode, socket, displayName, navigate]);

  const handleVoteSubmit = (votes) => {
    socket.emit('submit_vote', {
      roomCode,
      roomId: roomData._id,
      pollId: activePoll._id,
      voterName: displayName,
      votes
    });
  };

  if (!roomData) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</div>;

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '80vh'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 style={{margin: 0, fontSize: '1.5rem'}}>CollabPoll <span style={{color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 'normal'}}>| {displayName}</span></h1>
        <div style={{background: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', padding: '0.25rem 0.75rem', borderStyle: 'solid', borderWidth: '1px'}}>
          Room: <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{roomCode}</span>
        </div>
      </div>

      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
        {!activePoll ? (
          <div className="card" style={{textAlign: 'center', padding: '4rem', marginTop: '2rem'}}>
            <h2>Waiting for presenter...</h2>
            <p className="text-muted text-xl mt-4">The next poll will appear here automatically.</p>
          </div>
        ) : activePoll.status === 'active' ? (
          <div style={{width: '100%'}}>
            <VotingInterface poll={activePoll} onSubmit={handleVoteSubmit} submitted={submitted} />
          </div>
        ) : (
          <div style={{width: '100%', maxWidth: '800px', height: '500px'}}>
            <LiveResults poll={activePoll} results={pollResults} totalVoters={totalVoters} />
          </div>
        )}
      </div>
    </div>
  );
}
