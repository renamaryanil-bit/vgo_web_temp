import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import LocationCard from '../components/LocationCard';
import LoadingScreen from '../components/LoadingScreen';
import { getDashboardSummary, getLocations } from '../api';
import './common.css';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [sumData, locData] = await Promise.all([
          getDashboardSummary(),
          getLocations(),
        ]);

        setSummary(sumData);
        setLocations(locData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('CRITICAL: FAILED TO ESTABLISH LINK TO BACKEND DATABUS');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <LoadingScreen />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-screen">
          [ERROR] {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-enter page-container flex-column page-gap-lg">

        <div className="section-header">
          <div>
            <h1 className="page-title">OVERVIEW</h1>
          </div>

          <div className="mono-medium">
            ACTIVE_CONNECTIONS:{' '}
            <span style={{ color: 'var(--color-lime)' }}>
              {summary?.activeRobots || 0}
            </span>{' '}
            / {summary?.totalRobots || 0}
          </div>
        </div>

        <div className="metrics-grid">
          <StatCard
            label="Locations"
            value={summary?.totalLocations || 0}
            icon="🛰️"
          />

          <StatCard
            label="Total Robot Fleet"
            value={summary?.totalRobots || 0}
            icon="🤖"
          />

          <StatCard
            label="Active Units"
            value={summary?.activeRobots || 0}
            unit={`/ ${summary?.totalRobots || 0}`}
            icon="⚡"
          />

          <StatCard
            label="Cumulative Distance"
            value={
              summary?.totalDistance != null
                ? Math.round(summary.totalDistance).toLocaleString()
                : '0'
            }
            unit="m"
            icon="🛣️"
          />
        </div>

        <div>
          <div
            className="section-label"
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--color-cyan)',
              }}
            />
            LOCATIONS
          </div>

          {locations.length === 0 ? (
            <div className="empty-state">
              NO ACTIVE SECTORS DETECTED
            </div>
          ) : (
            <div className="locations-grid">
              {locations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;