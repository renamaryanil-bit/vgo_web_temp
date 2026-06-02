import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DistanceChart from '../components/DistanceChart';
import RideTable from '../components/RideTable';
import LoadingScreen from '../components/LoadingScreen';
import { getRobot, getRobotRides, getRobotStats } from '../api';

function RobotPage() {
  const { id } = useParams();

  const [robot, setRobot] = useState(null);
  const [rides, setRides] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRides, setTotalRides] = useState(0);

  const [period, setPeriod] = useState('hourly'); // Default hourly for robots

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRides, setLoadingRides] = useState(false);
  const [error, setError] = useState(null);

  // Fetch static robot details on mount or ID change
  useEffect(() => {
    async function fetchRobotData() {
      try {
        setLoading(true);
        const data = await getRobot(id);
        setRobot(data);
        setError(null);
        setPage(1); // Reset page on robot change
      } catch (err) {
        console.error('Error fetching robot details:', err);
        setError('CRITICAL: TIMEOUT ACQUIRING SYSTEM LOCK ON OPERATOR');
      } finally {
        setLoading(false);
      }
    }
    fetchRobotData();
  }, [id]);

  // Fetch telemetry chart stats when period or ID changes
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        const data = await getRobotStats(id, period);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching robot stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    if (id) {
      fetchStats();
    }
  }, [id, period]);

  // Fetch rides logs when page or ID changes
  useEffect(() => {
    async function fetchRides() {
      try {
        setLoadingRides(true);
        const data = await getRobotRides(id, page, 10); // Limit 10 per page
        setRides(data.rides || []);
        setTotalPages(data.totalPages || 1);
        setTotalRides(data.total || 0);
      } catch (err) {
        console.error('Error fetching robot rides:', err);
      } finally {
        setLoadingRides(false);
      }
    }
    if (id) {
      fetchRides();
    }
  }, [id, page]);

  if (loading) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  if (error || !robot) {
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
          <div>[ERROR] {error || 'ROBOT SYSTEM REGISTER NOT DETECTED'}</div>
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

  const distanceM = Math.round(robot.totalDistance).toLocaleString();
  const formattedLastActive = robot.lastActive
    ? new Date(robot.lastActive).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
    : 'NEVER';

  return (
    <Layout>
      <div
        className="page-enter"
        style={{
          padding: '24px 32px',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Breadcrumb Path */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link to="/dashboard" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            OVERVIEW
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          {robot.location && (
            <>
              <Link to={`/location/${robot.location._id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                STATION: {robot.location.name}
              </Link>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            </>
          )}
          <span style={{ color: 'var(--color-cyan)' }}>UNIT: {robot.robotId}</span>
        </div>

        {/* Master Robot Header Card */}
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-cyan)',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-cyan)',
                  border: '1px solid var(--color-cyan)',
                  padding: '2px 8px',
                }}
              >
                {robot.robotId}
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
              {robot.name}
            </h1>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              textAlign: 'right',
            }}
          >
            SYS_IDENTIFIER: <span style={{ color: 'var(--color-text-primary)' }}>{robot._id}</span>
            <br />
            LAST LOG: <span style={{ color: 'var(--color-text-primary)' }}>{formattedLastActive}</span>
          </div>
        </div>

        {/* Stat Rows Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Stat 1 */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 600, color: 'var(--color-cyan)' }}>
              {distanceM} <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>m</span>
            </div>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '6px' }}>
              CUMULATIVE DISTANCE
            </div>
          </div>

          {/* Stat 2 */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {totalRides}
            </div>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '6px' }}>
              PREVIOUS RIDES
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: 'var(--color-text-muted)', lineHeight: '1.2', marginTop: '4px' }}>
              * A new ride is recorded once the bot comes to a standstill and starts up again.
            </div>
          </div>

          {/* Stat 3 */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {robot.location ? (
                <Link to={`/location/${robot.location._id}`} style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>
                  {robot.location.name}
                </Link>
              ) : (
                'UNASSIGNED STATION'
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '10px', color: 'var(--color-text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '12px' }}>
              LOCATION
            </div>
          </div>
        </div>

        {/* 2-Column Split: Stats Graphs & Action History */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
          }}
        >
          {/* Chart Section */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-headline)' }}>
                  UNIT STABILITY & CYCLE PATHS
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Hourly and daily distance logs calculated via encoder tick tracking
                </div>
              </div>

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

            <DistanceChart data={chartData} period={period} loading={loadingStats} />
          </div>

          {/* Ride History Logs Table */}
          <div className="card" style={{ padding: '24px 0' }}>
            <div style={{ padding: '0 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-headline)' }}>
                  RIDE LOGS
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Detailed historical runs executed by this unit
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                PAGE {page} OF {totalPages}
              </span>
            </div>

            <RideTable rides={rides} loading={loadingRides} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                  padding: '0 24px',
                }}
              >
                <div className="toggle-group">
                  <button
                    className="toggle-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      opacity: page === 1 ? 0.3 : 1,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    &lt; PREV
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      opacity: page === totalPages ? 0.3 : 1,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    NEXT &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RobotPage;
