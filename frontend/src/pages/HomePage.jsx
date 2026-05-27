import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="grid-bg scanline page-enter"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-jet)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Decorative Border Accents */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '40px',
          height: '40px',
          borderLeft: '2px solid var(--color-cyan)',
          borderTop: '2px solid var(--color-cyan)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRight: '2px solid var(--color-cyan)',
          borderTop: '2px solid var(--color-cyan)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '40px',
          height: '40px',
          borderLeft: '2px solid var(--color-cyan)',
          borderBottom: '2px solid var(--color-cyan)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRight: '2px solid var(--color-cyan)',
          borderBottom: '2px solid var(--color-cyan)',
        }}
      />

      {/* Terminal Telemetry Info */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        SYS_STATUS: ONLINE // SECURE_CON: E2EE // GRID_COORD: WH-04-A
      </div>

      {/* Main Core Box */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-cyan)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
          }}
        >
          [ RACING TELEMETRY HUB ]
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '48px',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}
        >
          VGO RACING
        </h1>
        <div
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '18px',
            fontWeight: 300,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          Robot Hub
        </div>

        {/* Pulsing Mechanical Button */}
        <button
          className="btn-enter"
          onClick={() => navigate('/dashboard')}
        >
          Enter Dashboard
        </button>
      </div>

      {/* Footer Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        © {new Date().getFullYear()} VGO AUTOMATION SYSTEMS INC. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}

export default HomePage;
