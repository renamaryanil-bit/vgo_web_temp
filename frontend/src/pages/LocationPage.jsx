import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RobotRow from '../components/RobotRow';
import DistanceChart from '../components/DistanceChart';
import LoadingScreen from '../components/LoadingScreen';
import { getLocation, getLocationRobots, getLocationStats } from '../api';

function LocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [robots, setRobots] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('daily'); // default daily

  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);

  // Fetch static location detail + robots list on mount or ID change
  useEffect(() => {
    async function fetchLocationDetails() {
      try {
        setLoading(true);
        const [locData, robData] = await Promise.all([
          getLocation(id),
          getLocationRobots(id),
        ]);
        setLocation(locData);
        setRobots(robData);
        setError(null);
      } catch (err) {
        console.error('Error fetching location info:', err);
        setError('CRITICAL: LOST TELEMETRY LOCK ON THIS COORDINATE');
      } finally {
        setLoading(false);
      }
    }
    fetchLocationDetails();
  }, [id]);

  // Fetch stats when period or ID changes
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingChart(true);
        const data = await getLocationStats(id, period);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingChart(false);
      }
    }
    if (id) {
      fetchStats();
    }
  }, [id, period]);

  if (loading) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  if (error || !location) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            padding: '24px',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div>[ERROR] {error || 'LOCATION RECORD NOT DETECTED'}</div>
          <Link
            to="/dashboard"
            style={{
              color: 'var(--color-cyan)',
              fontFamily: 'var(--font-headline)',
              textDecoration: 'none',
              fontSize: '12px',
              border: '1px solid var(--color-cyan)',
              padding: '6px 16px',
            }}
          >
            RETURN TO COMMAND CENTER
          </Link>
        </div>
      </Layout>
    );
  }

  const distanceM = Math.round(location.totalDistance).toLocaleString();

  return (
    <Layout>
      <div className="page-enter" style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        {/* Left Sidebar: Robots in this location */}
        <div className="sidebar">
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--color-steel)',
              fontFamily: 'var(--font-headline)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'var(--color-jet)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>ASSIGNED UNITS ({robots.length})</span>
          </div>

          {robots.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              NO ROBOTS STATIONED HERE
            </div>
          ) : (
            <div>
              {robots.map((robot) => (
                <RobotRow
                  key={robot._id}
                  robot={robot}
                  isActive={false}
                  onClick={() => navigate(`/robot/${robot._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-jet)', padding: '24px 32px' }}>
          {/* Breadcrumbs */}
          <Link
            to="/dashboard"
            style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '20px',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-cyan)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-secondary)')}
          >
            &lt;&lt; BACK TO OVERVIEW
          </Link>

          {/* Heading Sector */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--color-steel)',
              paddingBottom: '20px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>
                  {location.name}
                </h1>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--color-cyan)',
                    border: '1px solid var(--color-cyan)',
                    padding: '2px 10px',
                  }}
                >
                  {location.code}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                📍 CITY: {location.address || 'UNDEFINED'}
              </p>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: location.isActive ? 'var(--color-lime)' : 'var(--color-offline)',
                border: `1px solid ${location.isActive ? 'var(--color-lime)' : 'var(--color-offline)'}`,
                padding: '4px 12px',
                textTransform: 'uppercase',
              }}
            >
              {location.isActive ? 'LOCATION ONLINE' : 'LOCATION OFFLINE'}
            </div>
          </div>

          {/* Stat Mini Dashboard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {/* Stat Box 1 */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {robots.length}
              </div>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>
                STATIONED ROBOTS
              </div>
            </div>

            {/* Stat Box 2 */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--color-lime)' }}>
                {location.activeCount}
              </div>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>
                ACTIVE BOTS
              </div>
            </div>

            {/* Stat Box 3 */}
            <div className="card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--color-cyan)' }}>
                {distanceM} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>m</span>
              </div>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>
                CUMULATIVE RANGE
              </div>
            </div>
          </div>

          {/* Interactive Chart Core */}
          <div className="card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-headline)',
                  }}
                >
                  LOCATION TELEMETRY RECORD
                </h3>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Distance traveled per cycle in meters
                </div>
              </div>

              {/* Period Selectors */}
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${period === 'hourly' ? 'toggle-btn--active' : ''}`}
                  onClick={() => setPeriod('hourly')}
                >
                  HOURLY (24H)
                </button>
                <button
                  className={`toggle-btn ${period === 'daily' ? 'toggle-btn--active' : ''}`}
                  onClick={() => setPeriod('daily')}
                >
                  DAILY (7D)
                </button>
              </div>
            </div>

            {/* Chart Component */}
            <DistanceChart data={chartData} period={period} loading={loadingChart} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LocationPage;
