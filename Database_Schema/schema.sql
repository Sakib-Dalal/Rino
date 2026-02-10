-- COPY WRITE BY SAKIB DALAL - This SQL script sets up the database schema for Rihno, a host and network monitoring system. It creates tables for storing time-series metrics, network maps, individual connections, alerts, and agent information. It also defines indexes for efficient querying, continuous aggregates for real-time dashboards, retention policies to manage data lifecycle, and compression policies to optimize storage. Finally, it includes views for active agents, recent alerts, and suspicious activity summaries. 

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ========== AGENT METRICS TABLE ==========
-- Main time-series table for all host and network metrics
CREATE TABLE IF NOT EXISTS rihno_metrics (
    time                        TIMESTAMPTZ NOT NULL,
    agent_id                    TEXT NOT NULL,
    email                       TEXT NOT NULL,
    agent_name                  TEXT NOT NULL,
    agent_type                  TEXT NOT NULL,

    -- ========== HOST-BASED FEATURES ==========
    -- Process Features
    process_count               INTEGER DEFAULT 0,
    process_creation_rate       INTEGER DEFAULT 0,
    process_termination_rate    INTEGER DEFAULT 0,
    high_cpu_process_count      INTEGER DEFAULT 0,
    high_mem_process_count      INTEGER DEFAULT 0,
    avg_process_cpu             DOUBLE PRECISION DEFAULT 0,
    avg_process_memory          DOUBLE PRECISION DEFAULT 0,
    avg_process_rss             BIGINT DEFAULT 0,
    avg_process_vms             BIGINT DEFAULT 0,
    total_threads               INTEGER DEFAULT 0,
    zombie_process_count        INTEGER DEFAULT 0,
    root_process_count          INTEGER DEFAULT 0,
    avg_process_age_seconds     DOUBLE PRECISION DEFAULT 0,
    process_with_many_threads   INTEGER DEFAULT 0,
    suspicious_process_names    INTEGER DEFAULT 0,
    total_file_descriptors      INTEGER DEFAULT 0,

    -- System Resources
    system_cpu                  DOUBLE PRECISION DEFAULT 0,
    avg_core_cpu                DOUBLE PRECISION DEFAULT 0,
    system_memory_percent       DOUBLE PRECISION DEFAULT 0,
    system_memory_used          BIGINT DEFAULT 0,
    system_memory_available     BIGINT DEFAULT 0,
    system_memory_total         BIGINT DEFAULT 0,
    swap_used_percent           DOUBLE PRECISION DEFAULT 0,
    swap_total                  BIGINT DEFAULT 0,
    swap_used                   BIGINT DEFAULT 0,

    -- Disk I/O
    disk_read_bytes             BIGINT DEFAULT 0,
    disk_write_bytes            BIGINT DEFAULT 0,
    disk_read_rate              DOUBLE PRECISION DEFAULT 0,
    disk_write_rate             DOUBLE PRECISION DEFAULT 0,
    disk_read_count             BIGINT DEFAULT 0,
    disk_write_count            BIGINT DEFAULT 0,
    disk_io_rate                DOUBLE PRECISION DEFAULT 0,

    -- User Sessions
    logged_in_users             INTEGER DEFAULT 0,
    system_uptime               BIGINT DEFAULT 0,
    system_boot_time            BIGINT DEFAULT 0,

    -- Derived Host Features
    cpu_usage_spike             DOUBLE PRECISION DEFAULT 0,
    memory_usage_spike          DOUBLE PRECISION DEFAULT 0,

    -- ========== NETWORK-BASED FEATURES ==========
    -- Connection Statistics
    total_connections           INTEGER DEFAULT 0,
    tcp_connections             INTEGER DEFAULT 0,
    udp_connections             INTEGER DEFAULT 0,
    established_connections     INTEGER DEFAULT 0,
    listen_connections          INTEGER DEFAULT 0,
    time_wait_connections       INTEGER DEFAULT 0,
    syn_sent_connections        INTEGER DEFAULT 0,
    syn_recv_connections        INTEGER DEFAULT 0,
    close_wait_connections      INTEGER DEFAULT 0,
    fin_wait_connections        INTEGER DEFAULT 0,

    -- Interface Statistics
    net_bytes_sent              BIGINT DEFAULT 0,
    net_bytes_recv              BIGINT DEFAULT 0,
    net_packets_sent            BIGINT DEFAULT 0,
    net_packets_recv            BIGINT DEFAULT 0,
    net_errors_in               BIGINT DEFAULT 0,
    net_errors_out              BIGINT DEFAULT 0,
    net_drops_in                BIGINT DEFAULT 0,
    net_drops_out               BIGINT DEFAULT 0,
    net_send_rate               DOUBLE PRECISION DEFAULT 0,
    net_recv_rate               DOUBLE PRECISION DEFAULT 0,
    net_packet_send_rate        DOUBLE PRECISION DEFAULT 0,
    net_packet_recv_rate        DOUBLE PRECISION DEFAULT 0,

    -- IP Address Features
    unique_source_ips           INTEGER DEFAULT 0,
    unique_dest_ips             INTEGER DEFAULT 0,
    new_source_ips              INTEGER DEFAULT 0,
    private_ip_connections      INTEGER DEFAULT 0,
    public_ip_connections       INTEGER DEFAULT 0,
    top_source_ip_count         INTEGER DEFAULT 0,
    top_source_ip               TEXT DEFAULT '',

    -- Port Features
    unique_local_ports          INTEGER DEFAULT 0,
    unique_remote_ports         INTEGER DEFAULT 0,
    well_known_port_connections INTEGER DEFAULT 0,
    ephemeral_port_connections  INTEGER DEFAULT 0,
    suspicious_port_connections INTEGER DEFAULT 0,
    port_scan_indicators        INTEGER DEFAULT 0,

    -- Protocol Distribution
    tcp_ratio                   DOUBLE PRECISION DEFAULT 0,
    udp_ratio                   DOUBLE PRECISION DEFAULT 0,
    tcp_udp_ratio               DOUBLE PRECISION DEFAULT 0,

    -- Process Network Activity
    processes_with_net_activity INTEGER DEFAULT 0,
    avg_connections_per_process DOUBLE PRECISION DEFAULT 0,

    -- Traffic Rates
    connection_creation_rate    INTEGER DEFAULT 0,
    connection_termination_rate INTEGER DEFAULT 0,

    -- Geographic/External
    external_ip_count           INTEGER DEFAULT 0,
    loopback_connections        INTEGER DEFAULT 0,
    broadcast_connections       INTEGER DEFAULT 0,

    -- Derived Network Features
    connection_churn_rate       DOUBLE PRECISION DEFAULT 0,
    connection_density          DOUBLE PRECISION DEFAULT 0,
    port_scanning_score         DOUBLE PRECISION DEFAULT 0,
    data_exfiltration_score     DOUBLE PRECISION DEFAULT 0,
    bandwidth_asymmetry         DOUBLE PRECISION DEFAULT 0,
    c2_communication_score      DOUBLE PRECISION DEFAULT 0,
    failed_connection_ratio     DOUBLE PRECISION DEFAULT 0,

    -- Network Map Summary
    total_incoming_connections  INTEGER DEFAULT 0,
    total_outgoing_connections  INTEGER DEFAULT 0,
    unique_incoming_ips         INTEGER DEFAULT 0,
    unique_outgoing_ips         INTEGER DEFAULT 0,
    local_ips_count             INTEGER DEFAULT 0
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('rihno_metrics', 'time', if_not_exists => TRUE);

-- ========== NETWORK MAP SNAPSHOTS TABLE ==========
-- Stores full network map JSON snapshots for detailed analysis
CREATE TABLE IF NOT EXISTS rihno_network_maps (
    time                TIMESTAMPTZ NOT NULL,
    agent_id            TEXT NOT NULL,
    email               TEXT NOT NULL,
    agent_name          TEXT NOT NULL,
    network_map_json    JSONB NOT NULL
);

SELECT create_hypertable('rihno_network_maps', 'time', if_not_exists => TRUE);

-- ========== NETWORK CONNECTIONS TABLE ==========
-- Individual connection details for granular analysis
CREATE TABLE IF NOT EXISTS rihno_connections (
    time            TIMESTAMPTZ NOT NULL,
    agent_id        TEXT NOT NULL,
    agent_name      TEXT NOT NULL,
    remote_ip       TEXT NOT NULL,
    remote_port     INTEGER NOT NULL,
    local_ip        TEXT NOT NULL,
    local_port      INTEGER NOT NULL,
    protocol        TEXT NOT NULL,
    state           TEXT NOT NULL,
    pid             INTEGER DEFAULT 0,
    process_name    TEXT DEFAULT '',
    direction       TEXT NOT NULL,  -- 'incoming' or 'outgoing'
    is_private      BOOLEAN DEFAULT FALSE,
    is_loopback     BOOLEAN DEFAULT FALSE,
    is_suspicious   BOOLEAN DEFAULT FALSE
);

SELECT create_hypertable('rihno_connections', 'time', if_not_exists => TRUE);

-- ========== ALERTS TABLE ==========
-- Generated alerts based on anomaly detection
CREATE TABLE IF NOT EXISTS rihno_alerts (
    id              BIGSERIAL,
    time            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agent_id        TEXT NOT NULL,
    agent_name      TEXT NOT NULL,
    email           TEXT NOT NULL,
    alert_type      TEXT NOT NULL,
    severity        TEXT NOT NULL,  -- 'low', 'medium', 'high', 'critical'
    description     TEXT NOT NULL,
    metric_name     TEXT DEFAULT '',
    metric_value    DOUBLE PRECISION DEFAULT 0,
    threshold       DOUBLE PRECISION DEFAULT 0,
    acknowledged    BOOLEAN DEFAULT FALSE,
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ
);

SELECT create_hypertable('rihno_alerts', 'time', if_not_exists => TRUE);

-- ========== AGENT REGISTRY TABLE ==========
-- Tracks registered agents and their status
CREATE TABLE IF NOT EXISTS rihno_agents (
    agent_id        TEXT PRIMARY KEY,
    agent_name      TEXT NOT NULL,
    agent_type      TEXT NOT NULL,
    email           TEXT NOT NULL,
    first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE,
    os_info         TEXT DEFAULT '',
    ip_address      TEXT DEFAULT ''
);

-- ========== INDEXES ==========
-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_agent_id ON rihno_metrics (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_email ON rihno_metrics (email, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_agent_name ON rihno_metrics (agent_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_suspicious ON rihno_metrics (time DESC)
    WHERE suspicious_process_names > 0 OR suspicious_port_connections > 0;
CREATE INDEX IF NOT EXISTS idx_metrics_high_cpu ON rihno_metrics (time DESC)
    WHERE system_cpu > 90;

-- Network maps indexes
CREATE INDEX IF NOT EXISTS idx_netmap_agent ON rihno_network_maps (agent_id, time DESC);

-- Connections indexes
CREATE INDEX IF NOT EXISTS idx_conn_agent ON rihno_connections (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_conn_remote_ip ON rihno_connections (remote_ip, time DESC);
CREATE INDEX IF NOT EXISTS idx_conn_suspicious ON rihno_connections (time DESC)
    WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_conn_direction ON rihno_connections (direction, time DESC);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_agent ON rihno_alerts (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON rihno_alerts (severity, time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON rihno_alerts (time DESC)
    WHERE resolved = FALSE;

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_email ON rihno_agents (email);
CREATE INDEX IF NOT EXISTS idx_agents_active ON rihno_agents (is_active);

-- ========== CONTINUOUS AGGREGATES ==========
-- 1-minute aggregates for dashboards
CREATE MATERIALIZED VIEW IF NOT EXISTS rihno_metrics_1min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    agent_id,
    agent_name,
    email,
    AVG(system_cpu) AS avg_cpu,
    MAX(system_cpu) AS max_cpu,
    AVG(system_memory_percent) AS avg_memory,
    MAX(system_memory_percent) AS max_memory,
    AVG(total_connections) AS avg_connections,
    MAX(total_connections) AS max_connections,
    SUM(suspicious_port_connections) AS total_suspicious_ports,
    SUM(suspicious_process_names) AS total_suspicious_processes,
    AVG(net_send_rate) AS avg_net_send_rate,
    AVG(net_recv_rate) AS avg_net_recv_rate,
    MAX(port_scanning_score) AS max_port_scan_score,
    MAX(data_exfiltration_score) AS max_exfil_score,
    MAX(c2_communication_score) AS max_c2_score,
    AVG(connection_churn_rate) AS avg_churn_rate,
    AVG(bandwidth_asymmetry) AS avg_bandwidth_asymmetry,
    AVG(process_count) AS avg_process_count,
    MAX(process_count) AS max_process_count,
    AVG(disk_io_rate) AS avg_disk_io_rate
FROM rihno_metrics
GROUP BY bucket, agent_id, agent_name, email
WITH NO DATA;

-- Refresh policy: refresh every 1 minute, covering last 10 minutes
SELECT add_continuous_aggregate_policy('rihno_metrics_1min',
    start_offset    => INTERVAL '10 minutes',
    end_offset      => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute',
    if_not_exists   => TRUE
);

-- 1-hour aggregates for historical analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS rihno_metrics_1hr
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    agent_id,
    agent_name,
    email,
    AVG(system_cpu) AS avg_cpu,
    MAX(system_cpu) AS max_cpu,
    MIN(system_cpu) AS min_cpu,
    AVG(system_memory_percent) AS avg_memory,
    MAX(system_memory_percent) AS max_memory,
    AVG(total_connections) AS avg_connections,
    MAX(total_connections) AS max_connections,
    SUM(suspicious_port_connections) AS total_suspicious_ports,
    SUM(suspicious_process_names) AS total_suspicious_processes,
    AVG(net_send_rate) AS avg_net_send_rate,
    AVG(net_recv_rate) AS avg_net_recv_rate,
    MAX(port_scanning_score) AS max_port_scan_score,
    MAX(data_exfiltration_score) AS max_exfil_score,
    MAX(c2_communication_score) AS max_c2_score,
    AVG(process_count) AS avg_process_count,
    AVG(disk_io_rate) AS avg_disk_io_rate,
    COUNT(*) AS sample_count
FROM rihno_metrics
GROUP BY bucket, agent_id, agent_name, email
WITH NO DATA;

SELECT add_continuous_aggregate_policy('rihno_metrics_1hr',
    start_offset    => INTERVAL '3 hours',
    end_offset      => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists   => TRUE
);

-- ========== RETENTION POLICIES ==========
-- Keep raw metrics for 30 days
SELECT add_retention_policy('rihno_metrics', INTERVAL '30 days', if_not_exists => TRUE);

-- Keep network maps for 7 days (large JSON data)
SELECT add_retention_policy('rihno_network_maps', INTERVAL '7 days', if_not_exists => TRUE);

-- Keep individual connections for 7 days
SELECT add_retention_policy('rihno_connections', INTERVAL '7 days', if_not_exists => TRUE);

-- Keep alerts for 90 days
SELECT add_retention_policy('rihno_alerts', INTERVAL '90 days', if_not_exists => TRUE);

-- Keep 1-minute aggregates for 7 days
SELECT add_retention_policy('rihno_metrics_1min', INTERVAL '7 days', if_not_exists => TRUE);

-- Keep 1-hour aggregates for 365 days
SELECT add_retention_policy('rihno_metrics_1hr', INTERVAL '365 days', if_not_exists => TRUE);

-- ========== COMPRESSION POLICIES ==========
-- Compress raw metrics after 2 days
ALTER TABLE rihno_metrics SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'agent_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('rihno_metrics', INTERVAL '2 days', if_not_exists => TRUE);

-- Compress connections after 2 days
ALTER TABLE rihno_connections SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'agent_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('rihno_connections', INTERVAL '2 days', if_not_exists => TRUE);

-- ========== USEFUL QUERY VIEWS ==========
-- Active agents view
CREATE OR REPLACE VIEW active_agents AS
SELECT
    agent_id,
    agent_name,
    agent_type,
    email,
    last_seen,
    EXTRACT(EPOCH FROM (NOW() - last_seen)) AS seconds_since_last_seen
FROM rihno_agents
WHERE is_active = TRUE
  AND last_seen > NOW() - INTERVAL '5 minutes';

-- Recent alerts view
CREATE OR REPLACE VIEW recent_alerts AS
SELECT
    id,
    time,
    agent_id,
    agent_name,
    alert_type,
    severity,
    description,
    metric_value,
    threshold
FROM rihno_alerts
WHERE resolved = FALSE
ORDER BY
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    time DESC;

-- Suspicious activity summary
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    agent_id,
    agent_name,
    SUM(suspicious_port_connections) AS suspicious_ports,
    SUM(suspicious_process_names) AS suspicious_processes,
    MAX(port_scanning_score) AS max_port_scan,
    MAX(data_exfiltration_score) AS max_exfil,
    MAX(c2_communication_score) AS max_c2,
    MAX(failed_connection_ratio) AS max_failed_ratio
FROM rihno_metrics
WHERE time > NOW() - INTERVAL '1 hour'
  AND (suspicious_port_connections > 0
       OR suspicious_process_names > 0
       OR port_scanning_score > 0
       OR data_exfiltration_score > 0
       OR c2_communication_score > 0)
GROUP BY bucket, agent_id, agent_name
ORDER BY bucket DESC;