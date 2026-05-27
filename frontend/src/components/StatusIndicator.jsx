const statusConfig = {
  active: {
    className: 'status-dot--active',
    label: 'Active',
    color: 'var(--color-lime)',
  },
  idle: {
    className: 'status-dot--idle',
    label: 'Idle',
    color: 'var(--color-warning)',
  },
  offline: {
    className: 'status-dot--offline',
    label: 'Offline',
    color: 'var(--color-offline)',
  },
  maintenance: {
    className: 'status-dot--maintenance',
    label: 'Maintenance',
    color: 'var(--color-danger)',
  },
};

function StatusIndicator({ status = 'offline', size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.offline;
  const dotSize = size === 'md' ? '10px' : '8px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        className={`status-dot ${config.className}`}
        style={{ width: dotSize, height: dotSize }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'md' ? '13px' : '11px',
          color: config.color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {config.label}
      </span>
    </div>
  );
}

export default StatusIndicator;
