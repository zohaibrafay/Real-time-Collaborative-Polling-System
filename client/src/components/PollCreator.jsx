import { useState } from 'react';

export default function PollCreator({ onLaunch, previousPoll }) {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('single');
  const [points, setPoints] = useState(10);
  const [options, setOptions] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [chainCount, setChainCount] = useState(3);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: Date.now().toString(), text: '' }]);
    }
  };

  const updateOption = (id, text) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const removeOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter(o => o.id !== id));
    }
  };

  const handleChain = () => {
    if (!previousPoll || !previousPoll.results) return;
    
    // Sort options by points descending
    const sorted = [...previousPoll.options].sort((a, b) => {
      const scoreA = previousPoll.results[a.id] || 0;
      const scoreB = previousPoll.results[b.id] || 0;
      return scoreB - scoreA;
    });
    
    const topN = sorted.slice(0, chainCount).map((opt, i) => ({
      id: Date.now().toString() + i,
      text: opt.text
    }));

    setOptions(topN.length >= 2 ? topN : [...topN, { id: 'x1', text: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.text.trim());
    if (validOptions.length < 2) return alert('Need at least 2 options');
    onLaunch({
      question,
      options: validOptions,
      votingMode: mode,
      pointsPerUser: mode === 'weighted' ? points : 1
    });
    
    // Reset after launch
    setQuestion('');
    setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
  };

  return (
    <div className="card">
      <h2>Create New Poll</h2>
      
      {previousPoll && previousPoll.status === 'closed' && (
        <div style={{borderColor: 'var(--primary-color)', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', borderStyle: 'solid', borderWidth: '1px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>Chain from previous poll?</span>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <input 
                type="number" 
                min="2" max="6" 
                value={chainCount} 
                onChange={e => setChainCount(Number(e.target.value))}
                className="input-control"
                style={{ width: '80px', padding: '0.5rem' }}
              />
              <button type="button" onClick={handleChain} className="btn">Import Top {chainCount}</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Question</label>
          <input 
            type="text" className="input-control" required
            value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="What should we discuss next?"
          />
        </div>
        
        <div className="input-group">
          <label>Voting Mode</label>
          <select 
            className="input-control"
            value={mode} onChange={e => setMode(e.target.value)}
          >
            <option value="single">Single Choice</option>
            <option value="weighted">Weighted (Distribute Points)</option>
          </select>
        </div>

        {mode === 'weighted' && (
          <div className="input-group">
            <label>Points to distribute per user</label>
            <input 
              type="number" className="input-control" min="2" max="100"
              value={points} onChange={e => setPoints(Number(e.target.value))}
            />
          </div>
        )}

        <div className="input-group">
          <label>Options (2-6)</label>
          {options.map((opt, i) => (
            <div key={opt.id} style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <input 
                type="text" className="input-control" required
                value={opt.text} onChange={e => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(opt.id)} className="btn btn-danger" style={{padding: '0.75rem'}}>X</button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" onClick={addOption} className="btn" style={{marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)'}}>+ Add Option</button>
          )}
        </div>

        <button type="submit" className="btn btn-success" style={{width: '100%'}}>Launch Poll</button>
      </form>
    </div>
  );
}
