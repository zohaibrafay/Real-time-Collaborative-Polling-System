import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LiveResults({ poll, results, totalVoters }) {
  if (!poll || !results) return null;

  const data = {
    labels: poll.options.map(o => o.text),
    datasets: [
      {
        label: poll.votingMode === 'weighted' ? 'Points' : 'Votes',
        data: poll.options.map(o => results[o.id] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: poll.question,
        color: '#f8fafc',
        font: { size: 18 }
      },
    },
  };

  return (
    <div className="card" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Live Results</h2>
        <span className="badge" style={{background: poll.status === 'active' ? 'var(--success-color)' : 'var(--danger-color)'}}>
          {poll.status.toUpperCase()}
        </span>
      </div>
      
      <div style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>
        <strong>{totalVoters}</strong> people have voted
      </div>
      
      <div style={{flex: 1, minHeight: '300px', position: 'relative'}}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
