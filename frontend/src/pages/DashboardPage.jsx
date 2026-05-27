import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import LocationCard from '../components/LocationCard';
import LoadingScreen from '../components/LoadingScreen';
import { getDashboardSummary, getLocations } from '../api';

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          [ERROR] {error}
        </div>
      </Layout>
    );
  }

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
          gap: '32px',
        }}
      >
        {/* Header Block */}
        <div
          style={{
            borderBottom: '1px solid var(--color-steel)',
            paddingBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              OVERVIEW
            </h1>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            ACTIVE_CONNECTIONS: <span style={{ color: 'var(--color-lime)' }}>{summary?.activeRobots || 0}</span> / {summary?.totalRobots || 0}
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
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
            value={summary?.totalDistance != null ? Math.round(summary.totalDistance).toLocaleString() : '0'}
            unit="m"
            icon="🛣️"
          />
        </div>

        {/* Section: Monitored Locations */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
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

          {/* Locations Grid */}
          {locations.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px',
                background: 'var(--color-gunmetal)',
                border: '1px solid var(--color-steel)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              NO ACTIVE SECTORS DETECTED
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {locations.map((loc) => (
                <LocationCard key={loc._id} location={loc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
