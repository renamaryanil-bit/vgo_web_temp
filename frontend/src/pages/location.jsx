import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DistanceChart from '../components/DistanceChart';
import LoadingScreen from '../components/LoadingScreen';
import {
  getLocation,
  getLocationRobots,
  getLocationStats,
} from '../api';

import './common.css';

// Hardcoded rate: 1 meter = 5 Rs
const RATE_PER_METER = 5;

function LocationPage() {
  const { id } = useParams();

  const [location, setLocation] = useState(null);
  const [robots, setRobots] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [period, setPeriod] = useState('daily');

  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);

  // Which day is selected in the sidebar (index into dailyData)
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

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

  // Fetch daily stats for the sidebar (always daily)
  useEffect(() => {
    async function fetchDailyStats() {
      try {
        const data = await getLocationStats(id, 'daily');
        setDailyData(data);
        setSelectedDayIndex(null);
      } catch (err) {
        console.error('Error fetching daily stats for sidebar:', err);
      }
    }
    if (id) fetchDailyStats();
  }, [id]);

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

  const maxDailyDistance = dailyData.length > 0
    ? Math.max(...dailyData.map(d => d.distance), 1)
    : 1;

  const totalWeeklyDistance = dailyData.reduce((sum, d) => sum + d.distance, 0);
  const totalWeeklyCost = totalWeeklyDistance * RATE_PER_METER;

  return (
    <Layout>
      <div
        className="page-enter"
        style={{
          display: 'flex',
          height: 'calc(100vh - 56px)',
        }}
      >

        {/* ===== SIDEBAR: Daily Distance & Cost ===== */}
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Sidebar Header */}
          <div
            className="section-label"
            style={{
              padding: '20px 16px 16px',
              borderBottom: '1px solid var(--color-steel)',
              background: 'var(--color-jet)',
            }}
          >
            <div style={{ marginBottom: '2px' }}>
              DAILY DISTANCE LOG
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              Last 7 days • ₹{RATE_PER_METER}/m • Click for details
            </div>
          </div>

          {/* Day List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {dailyData.length === 0 ? (
              <div
                className="mono-medium"
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                }}
              >
                NO DAILY DATA AVAILABLE
              </div>
            ) : (
              dailyData.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                const dayCost = day.distance * RATE_PER_METER;
                return (
                  <div
                    key={idx}
                    className={`sidebar-item ${isSelected ? 'sidebar-item--active' : ''}`}
                    onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                    style={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '8px',
                      borderLeft: isSelected ? '3px solid var(--color-cyan)' : '3px solid transparent',
                      padding: '14px 16px',
                    }}
                  >
                    {/* Day row: label + distance */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--color-cyan)' : 'var(--color-text-primary)',
                          transition: 'color 200ms ease',
                        }}
                      >
                        {day.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isSelected ? 'var(--color-cyan)' : 'var(--color-text-primary)',
                          transition: 'color 200ms ease',
                        }}
                      >
                        {day.distance.toFixed(1)} m
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--color-steel)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (day.distance / maxDailyDistance) * 100)}%`,
                          background: isSelected
                            ? 'var(--color-cyan)'
                            : 'var(--color-cyan-dim)',
                          transition: 'width 400ms ease, background 200ms ease',
                          boxShadow: isSelected ? '0 0 8px rgba(0, 240, 255, 0.5)' : 'none',
                        }}
                      />
                    </div>

                    {/* Cost breakdown panel (expanded on click) */}
                    {isSelected && (
                      <div
                        className="page-enter"
                        style={{
                          marginTop: '4px',
                          padding: '12px',
                          background: 'var(--color-jet)',
                          border: '1px solid var(--color-steel)',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: '9px',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-muted)',
                            marginBottom: '10px',
                          }}
                        >
                          COST BREAKDOWN
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Distance
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-primary)' }}>
                            {day.distance.toFixed(1)} m
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Rate
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-primary)' }}>
                            ₹{RATE_PER_METER}/m
                          </span>
                        </div>

                        <div
                          style={{
                            borderTop: '1px solid var(--color-steel)',
                            paddingTop: '10px',
                            marginTop: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-headline)',
                              fontSize: '10px',
                              letterSpacing: '0.1em',
                              color: 'var(--color-text-secondary)',
                              textTransform: 'uppercase',
                            }}
                          >
                            Total Owed
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '20px',
                              fontWeight: 700,
                              color: 'var(--color-lime)',
                              textShadow: '0 0 12px rgba(173, 255, 47, 0.3)',
                            }}
                          >
                            ₹{dayCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: 7-day totals */}
          {dailyData.length > 0 && (
            <div
              style={{
                padding: '16px',
                borderTop: '1px solid var(--color-steel)',
                background: 'var(--color-jet)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  7-Day Total Distance
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {totalWeeklyDistance.toFixed(1)} m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  7-Day Total Cost
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-lime)', textShadow: '0 0 8px rgba(173, 255, 47, 0.2)' }}>
                  ₹{totalWeeklyCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
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