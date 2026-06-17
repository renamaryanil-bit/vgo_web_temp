function RideTable({ rides = [], loading = false }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return '—';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    if (diffMs < 0) return '—';
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const statusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--color-cyan)';
      case 'aborted': return 'var(--color-danger)';
      case 'in_progress': return 'var(--color-lime)';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="loading-bar" style={{ width: '100%', marginBottom: '16px' }} />
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          LOADING RIDE DATA...
        </div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        NO RIDES RECORDED
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Distance (m)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride, index) => (
            <tr key={ride.id || index}>
              <td style={{ color: 'var(--color-text-muted)' }}>{index + 1}</td>
              <td>{formatDate(ride.startTime)}</td>
              <td>{formatDate(ride.endTime)}</td>
              <td>{formatDuration(ride.startTime, ride.endTime)}</td>
              <td style={{ color: 'var(--color-cyan)' }}>
                {ride.distance != null ? ride.distance.toFixed(1) : '—'}
              </td>
              <td>
                <span
                  style={{
                    color: statusColor(ride.status),
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {ride.status || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RideTable;
