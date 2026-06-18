
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Locations ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  address    TEXT DEFAULT '',
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Robots ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS robots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id        TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'offline', 'maintenance')),
  total_distance  DOUBLE PRECISION DEFAULT 0,
  last_active     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Rides ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rides (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id       UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ,
  distance       DOUBLE PRECISION NOT NULL DEFAULT 0,
  encoder_ticks  INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'aborted')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_rides_robot_start   ON rides (robot_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_rides_location_start ON rides (location_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_robots_location      ON robots (location_id);

-- ── RPC: Dashboard — sum of all robot total_distance ─────────

CREATE OR REPLACE FUNCTION sum_robot_total_distance()
RETURNS DOUBLE PRECISION
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(SUM(total_distance), 0) FROM robots;
$$;

-- ── RPC: Robot stats per location ────────────────────────────
-- Returns robot_count, active_count, total_distance grouped by location_id

CREATE OR REPLACE FUNCTION get_location_robot_stats()
RETURNS TABLE (
  location_id   UUID,
  robot_count   BIGINT,
  active_count  BIGINT,
  total_distance DOUBLE PRECISION
)
LANGUAGE sql STABLE
AS $$
  SELECT
    r.location_id,
    COUNT(*)::BIGINT AS robot_count,
    COUNT(*) FILTER (WHERE r.status = 'active')::BIGINT AS active_count,
    COALESCE(SUM(r.total_distance), 0) AS total_distance
  FROM robots r
  GROUP BY r.location_id;
$$;

-- ── RPC: Single location robot stats ─────────────────────────

CREATE OR REPLACE FUNCTION get_single_location_robot_stats(loc_id UUID)
RETURNS TABLE (
  robot_count    BIGINT,
  active_count   BIGINT,
  total_distance DOUBLE PRECISION
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*)::BIGINT AS robot_count,
    COUNT(*) FILTER (WHERE r.status = 'active')::BIGINT AS active_count,
    COALESCE(SUM(r.total_distance), 0) AS total_distance
  FROM robots r
  WHERE r.location_id = loc_id;
$$;

-- ── RPC: Ride distance stats (hourly or daily) for a location ──

CREATE OR REPLACE FUNCTION get_location_ride_stats(loc_id UUID, period TEXT)
RETURNS TABLE (
  bucket    TIMESTAMPTZ,
  distance  DOUBLE PRECISION
)
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN period = 'hourly' THEN date_trunc('hour', r.start_time)
      ELSE date_trunc('day', r.start_time)
    END AS bucket,
    SUM(r.distance) AS distance
  FROM rides r
  WHERE r.location_id = loc_id
    AND r.start_time >= CASE
      WHEN period = 'hourly' THEN NOW() - INTERVAL '24 hours'
      ELSE NOW() - INTERVAL '7 days'
    END
  GROUP BY bucket
  ORDER BY bucket ASC;
$$;

-- ── RPC: Ride distance stats (hourly or daily) for a robot ───

CREATE OR REPLACE FUNCTION get_robot_ride_stats(rob_id UUID, period TEXT)
RETURNS TABLE (
  bucket    TIMESTAMPTZ,
  distance  DOUBLE PRECISION
)
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN period = 'hourly' THEN date_trunc('hour', r.start_time)
      ELSE date_trunc('day', r.start_time)
    END AS bucket,
    SUM(r.distance) AS distance
  FROM rides r
  WHERE r.robot_id = rob_id
    AND r.start_time >= CASE
      WHEN period = 'hourly' THEN NOW() - INTERVAL '24 hours'
      ELSE NOW() - INTERVAL '7 days'
    END
  GROUP BY bucket
  ORDER BY bucket ASC;
$$;
