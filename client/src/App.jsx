import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PresenterDashboard from './pages/PresenterDashboard';
import AudienceView from './pages/AudienceView';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/presenter/:roomCode" element={<PresenterDashboard />} />
          <Route path="/room/:roomCode" element={<AudienceView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
