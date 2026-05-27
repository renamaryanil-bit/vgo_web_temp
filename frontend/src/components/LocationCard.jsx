import { useNavigate } from 'react-router-dom';

function LocationCard({ location }) {
  const navigate = useNavigate();
  const {
    _id,
    name,
    code,
    robotCount = 0,
    activeCount = 0,
    totalDistance = 0,
    isActive,
  } = location;

  const distanceM = Math.round(totalDistance).toLocaleString();

  return (
    <div
      className="card card-interactive"
      onClick={() => navigate(`/location/${_id}`)}
      style={{
        borderLeft: '2px solid var(--color-cyan)',
        cursor: 'pointer',
      }}
    >
      {/* Top: Name + Code */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {name}
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-cyan)',
            border: '1px solid var(--color-cyan)',
            padding: '2px 8px',
            letterSpacing: '0.05em',
          }}
        >
          {code}
        </span>
      </div>

      {/* Middle: Stats Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {robotCount}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            TOTAL ROBOTS
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div className="status-dot status-dot--active" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-lime)',
              }}
            >
              {activeCount}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ACTIVE
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {distanceM}
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                marginLeft: '2px',
              }}
            >
              m
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            DISTANCE
          </div>
        </div>
      </div>

      {/* Bottom: Cyan accent line */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, var(--color-cyan), transparent)',
        }}
      />
    </div>
  );
}

export default LocationCard;
