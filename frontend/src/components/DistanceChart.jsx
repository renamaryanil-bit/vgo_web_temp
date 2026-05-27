import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: 'var(--color-gunmetal)',
        border: '1px solid var(--color-cyan)',
        padding: '10px 14px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
      }}
    >
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>
        {payload[0].value.toFixed(1)} m
      </div>
    </div>
  );
}

function DistanceChart({ data = [], period = 'hourly', loading = false }) {
  if (loading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div className="loading-bar" style={{ width: '100%', marginBottom: '16px' }} />
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          LOADING CHART DATA...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-steel)',
          background: 'var(--color-gunmetal)',
        }}
      >
        NO DATA AVAILABLE
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2A2A2E"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fill: '#888888',
            }}
            axisLine={{ stroke: '#2A2A2E' }}
            tickLine={{ stroke: '#2A2A2E' }}
            angle={data.length > 12 ? -45 : 0}
            textAnchor={data.length > 12 ? 'end' : 'middle'}
            height={50}
          />
          <YAxis
            tick={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fill: '#888888',
            }}
            axisLine={{ stroke: '#2A2A2E' }}
            tickLine={{ stroke: '#2A2A2E' }}
            label={{
              value: 'Distance (m)',
              angle: -90,
              position: 'insideLeft',
              style: {
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fill: '#555555',
              },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 240, 255, 0.05)' }} />
          <Bar
            dataKey="distance"
            fill="#00F0FF"
            radius={[0, 0, 0, 0]}
            maxBarSize={50}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.3))',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DistanceChart;
