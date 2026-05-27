function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '24px',
        position: 'relative',
      }}
      className="scanline"
    >
      <div
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--color-cyan)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        LOADING
      </div>
      <div className="loading-bar" style={{ width: '200px' }} />
    </div>
  );
}

export default LoadingScreen;
