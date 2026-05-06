import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import PollCreator from '../components/PollCreator';
import LiveResults from '../components/LiveResults';

export default function PresenterDashboard() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    // Fetch room data
    fetch(`http://localhost:3001/api/rooms/${roomCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else {
          setRoomData(data);
          socket.emit('join_room', { roomCode });
          
          // Check for active poll using the fetched room ID
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
      setPollResults({});
      setTotalVoters(0);
    };

    const handlePollResults = (data) => {
      // Allow updating results if the ID matches the one we know about
      setActivePoll(prev => {
        if (prev && data.pollId === prev._id) {
          setPollResults(data.results);
          setTotalVoters(data.totalVoters);
          if (data.final) {
            return { ...prev, status: 'closed' };
          }
        }
        return prev;
      });
    };

    const handlePollClosed = (poll) => {
      setActivePoll(poll);
    };

    socket.on('poll_active', handlePollActive);
    socket.on('poll_results', handlePollResults);
    socket.on('poll_closed', handlePollClosed);

    return () => {
      socket.off('poll_active', handlePollActive);
      socket.off('poll_results', handlePollResults);
      socket.off('poll_closed', handlePollClosed);
    };
  }, [roomCode, socket]);

  const handleLaunch = (pollData) => {
    if (roomData) {
      const presenterId = sessionStorage.getItem(`presenter_${roomCode}`);
      socket.emit('launch_poll', {
        roomCode,
        roomId: roomData._id,
        presenterId,
        ...pollData
      });
    }
  };

  const handleClose = () => {
    if (activePoll && activePoll.status === 'active') {
      const presenterId = sessionStorage.getItem(`presenter_${roomCode}`);
      socket.emit('close_poll', { roomCode, pollId: activePoll._id, presenterId });
    }
  };

  if (!roomData) return <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</div>;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 style={{margin: 0}}>Presenter Dashboard</h1>
        <div style={{background: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', borderStyle: 'solid', borderWidth: '1px', fontSize: '1.25rem', fontWeight: 'bold'}}>
          Room Code: <span style={{color: 'var(--primary-color)'}}>{roomCode}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <PollCreator onLaunch={handleLaunch} previousPoll={activePoll && activePoll.status === 'closed' ? { ...activePoll, results: pollResults } : null} />
          
          {activePoll && activePoll.status === 'active' && (
            <div className="card" style={{marginTop: '1rem', textAlign: 'center'}}>
              <h3 style={{marginBottom: '1rem'}}>Poll Actions</h3>
              <button onClick={handleClose} className="btn btn-danger" style={{width: '100%'}}>
                Close Active Poll
              </button>
            </div>
          )}
        </div>
        
        <div>
          {activePoll ? (
            <LiveResults poll={activePoll} results={pollResults} totalVoters={totalVoters} />
          ) : (
            <div className="card" style={{minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: 'var(--text-muted)', fontSize: '1.25rem'}}>
                No active poll. Create one to start!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
