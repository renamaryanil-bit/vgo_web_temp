import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import DashboardPage from './pages/dash';
import LocationPage from './pages/location';
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
