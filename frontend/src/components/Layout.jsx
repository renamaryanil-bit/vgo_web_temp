import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Layout({ children }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <nav
        style={{
          height: '56px',
          minHeight: '56px',
          backgroundColor: 'var(--color-jet)',
          borderBottom: '1px solid var(--color-steel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
        }}
      >
        {/* Left: Logo */}
        <Link
          to="/dashboard"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: '22px',
              color: 'var(--color-cyan)',
              letterSpacing: '0.05em',
            }}
          >
            VGO
          </span>
          <span
            style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 400,
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            TELEMETRY
          </span>
        </Link>

        {/* Right: Health + Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="status-dot status-dot--active" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.05em',
              }}
            >
              SYSTEM ONLINE
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              gap: '12px',
            }}
          >
            <span>{formatDate(time)}</span>
            <span style={{ color: 'var(--color-cyan)' }}>{formatTime(time)}</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
