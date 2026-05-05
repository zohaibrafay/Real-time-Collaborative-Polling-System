import { useState, useEffect } from 'react';

export default function VotingInterface({ poll, onSubmit, submitted }) {
  const [singleVote, setSingleVote] = useState('');
  const [weightedVotes, setWeightedVotes] = useState({});
  const [error, setError] = useState('');

  // Initialize weighted votes
  useEffect(() => {
    if (poll && poll.votingMode === 'weighted') {
      const initial = {};
      poll.options.forEach(o => { initial[o.id] = 0; });
      setWeightedVotes(initial);
    }
    setSingleVote('');
    setError('');
  }, [poll]);

  const handleWeightedChange = (id, value) => {
    const val = Number(value);
    setWeightedVotes(prev => ({ ...prev, [id]: val }));
  };

  const getPointsUsed = () => {
    return Object.values(weightedVotes).reduce((sum, val) => sum + val, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    let votes = [];
    if (poll.votingMode === 'single') {
      if (!singleVote) return setError('Please select an option');
      votes = [{ optionId: singleVote, points: 1 }];
    } else {
      const total = getPointsUsed();
      if (total !== poll.pointsPerUser) {
        return setError(`You must use exactly ${poll.pointsPerUser} points. Currently used: ${total}`);
      }
      votes = Object.entries(weightedVotes)
        .filter(([_, points]) => points > 0)
        .map(([optionId, points]) => ({
          optionId, points
        }));
    }

    onSubmit(votes);
  };

  if (!poll) return null;

  return (
    <div className="card" style={{maxWidth: '800px', margin: '0 auto', width: '100%'}}>
      <h2 style={{fontSize: '2rem', marginBottom: '2rem', textAlign: 'center'}}>{poll.question}</h2>

      {submitted && (
        <div style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem', border: '1px solid var(--success-color)'}}>
          Your vote has been recorded! You can change it while the poll is active.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {poll.votingMode === 'single' ? (
          <div>
            {poll.options.map(opt => (
              <label key={opt.id} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer', transition: 'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <input 
                  type="radio" 
                  name="singleVote" 
                  value={opt.id}
                  checked={singleVote === opt.id}
                  onChange={(e) => setSingleVote(e.target.value)}
                  style={{width: '1.5rem', height: '1.5rem', accentColor: 'var(--primary-color)'}}
                />
                <span style={{fontSize: '1.25rem'}}>{opt.text}</span>
              </label>
            ))}
          </div>
        ) : (
          <div>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <div style={{fontSize: '1.25rem', color: 'var(--text-muted)'}}>Points left to distribute</div>
              <div style={{fontSize: '3rem', fontWeight: 'bold', color: getPointsUsed() === poll.pointsPerUser ? 'var(--success-color)' : (getPointsUsed() > poll.pointsPerUser ? 'var(--danger-color)' : 'var(--primary-color)')}}>
                {poll.pointsPerUser - getPointsUsed()}
              </div>
            </div>

            {poll.options.map(opt => (
              <div key={opt.id} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem'}}>
                <div style={{flex: 1, fontSize: '1.25rem'}}>{opt.text}</div>
                <input 
                  type="range"
                  min="0"
                  max={poll.pointsPerUser}
                  value={weightedVotes[opt.id] || 0}
                  onChange={(e) => handleWeightedChange(opt.id, e.target.value)}
                  style={{flex: 2, height: '8px', borderRadius: '4px', background: 'var(--border-color)', outline: 'none'}}
                />
                <div style={{width: '40px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold'}}>{weightedVotes[opt.id] || 0}</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{color: 'var(--danger-color)', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold'}}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-success" style={{width: '100%', fontSize: '1.25rem', padding: '1rem'}}>
          Submit Vote
        </button>
      </form>
    </div>
  );
}
