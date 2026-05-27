import StatusIndicator from './StatusIndicator';

function RobotRow({ robot, isActive, onClick }) {
  const { name, robotId, status, totalDistance = 0 } = robot;
  const distanceM = Math.round(totalDistance);

  return (
    <div
      className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
      onClick={onClick}
    >
      <StatusIndicator status={status} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          {robotId}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {distanceM} m
      </div>
    </div>
  );
}

export default RobotRow;
