import { useNavigate } from 'react-router-dom';
import './common.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="grid-bg scanline page-enter home-root">

      <div className="corner-accent corner-top-left" />
      <div className="corner-accent corner-top-right" />
      <div className="corner-accent corner-bottom-left" />
      <div className="corner-accent corner-bottom-right" />

      <div className="home-top-info">
        SYS_STATUS: ONLINE // SECURE_CON: E2EE // GRID_COORD: WH-04-A
      </div>

      <div className="home-main-box">
        <div className="home-tagline">
          [ RACING TELEMETRY HUB ]
        </div>

        <h1 className="home-title">
          VGO RACING
        </h1>

        <div className="home-subtitle">
          Robot Hub
        </div>

        <button
          className="btn-enter"
          onClick={() => navigate('/dashboard')}
        >
          Enter Dashboard
        </button>
      </div>

      <div className="home-footer">
        © {new Date().getFullYear()} VGO AUTOMATION SYSTEMS INC. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}

export default HomePage;