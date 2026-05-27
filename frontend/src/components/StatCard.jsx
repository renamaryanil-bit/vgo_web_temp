function StatCard({ label, value, unit, icon }) {
  return (
    <div className="card" style={{ minWidth: '180px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--color-cyan)',
              lineHeight: 1.2,
            }}
          >
            {value ?? '—'}
            {unit && (
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  marginLeft: '4px',
                  fontWeight: 400,
                }}
              >
                {unit}
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: '8px',
            }}
          >
            {label}
          </div>
        </div>
        {icon && (
          <span style={{ fontSize: '24px', opacity: 0.5 }}>{icon}</span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
