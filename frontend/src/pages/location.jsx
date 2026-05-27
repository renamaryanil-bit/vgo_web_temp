import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RobotRow from '../components/RobotRow';
import DistanceChart from '../components/DistanceChart';
import LoadingScreen from '../components/LoadingScreen';
import {
  getLocation,
  getLocationRobots,
  getLocationStats,
} from '../api';

import './common.css';

function LocationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [robots, setRobots] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('daily');

  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);

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

    if (id) fetchStats();
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
        <div className="error-screen">
          <div>
            [ERROR] {error || 'LOCATION RECORD NOT DETECTED'}
          </div>

          <Link
            to="/dashboard"
            className="command-link"
          >
            RETURN TO COMMAND CENTER
          </Link>
        </div>
      </Layout>
    );
  }

  const distanceM = Math.round(
    location.totalDistance
  ).toLocaleString();

  return (
    <Layout>
      <div
        className="page-enter"
        style={{
          display: 'flex',
          height: 'calc(100vh - 56px)',
        }}
      >

        <div className="sidebar">
          <div
            className="section-label"
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--color-steel)',
              background: 'var(--color-jet)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              ASSIGNED UNITS ({robots.length})
            </span>
          </div>

          {robots.length === 0 ? (
            <div
              className="mono-medium"
              style={{
                padding: '24px',
                textAlign: 'center',
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
                  onClick={() =>
                    navigate(`/robot/${robot._id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--color-jet)',
            padding: '24px 32px',
          }}
        >

          <Link
            to="/dashboard"
            className="breadcrumb-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '20px',
            }}
          >
            &lt;&lt; BACK TO OVERVIEW
          </Link>

          <div className="section-header-lg">

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
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
                color: location.isActive
                  ? 'var(--color-lime)'
                  : 'var(--color-offline)',

                border: `1px solid ${
                  location.isActive
                    ? 'var(--color-lime)'
                    : 'var(--color-offline)'
                }`,

                padding: '4px 12px',
                textTransform: 'uppercase',
              }}
            >
              {location.isActive
                ? 'LOCATION ONLINE'
                : 'LOCATION OFFLINE'}
            </div>
          </div>

          <div className="stats-grid">

            <div className="card">
              <div className="stat-card-value">
                {robots.length}
              </div>

              <div className="stat-card-label">
                STATIONED ROBOTS
              </div>
            </div>

            <div className="card">
              <div
                className="stat-card-value"
                style={{
                  color: 'var(--color-lime)',
                }}
              >
                {location.activeCount}
              </div>

              <div className="stat-card-label">
                ACTIVE BOTS
              </div>
            </div>

            <div className="card">
              <div
                className="stat-card-value"
                style={{
                  color: 'var(--color-cyan)',
                }}
              >
                {distanceM}

                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {' '}m
                </span>
              </div>

              <div className="stat-card-label">
                CUMULATIVE RANGE
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '24px',
              marginTop: '32px',
            }}
          >

            <div className="chart-header">
              <div>
                <h3 className="section-title">
                  LOCATION TELEMETRY RECORD
                </h3>

                <div className="subtext">
                  Distance traveled per cycle in meters
                </div>
              </div>

              <div className="toggle-group">
                <button
                  className={`toggle-btn ${
                    period === 'hourly'
                      ? 'toggle-btn--active'
                      : ''
                  }`}
                  onClick={() => setPeriod('hourly')}
                >
                  HOURLY (24H)
                </button>

                <button
                  className={`toggle-btn ${
                    period === 'daily'
                      ? 'toggle-btn--active'
                      : ''
                  }`}
                  onClick={() => setPeriod('daily')}
                >
                  DAILY (7D)
                </button>
              </div>
            </div>

            <DistanceChart
              data={chartData}
              period={period}
              loading={loadingChart}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LocationPage;