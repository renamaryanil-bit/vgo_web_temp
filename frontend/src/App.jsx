import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LocationPage from './pages/LocationPage';
import RobotPage from './pages/RobotPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/location/:id" element={<LocationPage />} />
      <Route path="/robot/:id" element={<RobotPage />} />
    </Routes>
  );
}

export default App;
