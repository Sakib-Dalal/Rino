# RIHNO Database Schema

```sql
-- schema.sql
-- RIHNO IDS - TimescaleDB Schema
-- Run this once against your PostgreSQL/TimescaleDB instance

-- ============================================================
-- STEP 1: Enable TimescaleDB Extension
-- ============================================================
-- TimescaleDB adds time-series superpowers to PostgreSQL:
-- hypertables, compression, retention policies, continuous aggregates.
-- This must be enabled before creating any hypertable.
CREATE EXTENSION IF NOT EXISTS timescaledb;


-- ============================================================
-- STEP 2: Core Metrics Table (rihno_metrics)
-- ============================================================
-- This is the main table. Every 10 seconds each agent sends
-- a snapshot of 92 host + network metrics. Each row is one snapshot.
-- After creation we convert it to a TimescaleDB "hypertable"
-- which auto-partitions data by time for fast range queries.
CREATE TABLE IF NOT EXISTS rihno_metrics (
    -- ---- Identity columns ----
    -- Every row must have a timestamp and know which agent sent it
    time                        TIMESTAMPTZ NOT NULL,
    agent_id                    TEXT NOT NULL,
    email                       TEXT NOT NULL,
    agent_name                  TEXT NOT NULL,
    agent_type                  TEXT NOT NULL,

    -- ---- Process Features (16 columns) ----
    -- How many processes, how fast they spawn/die, resource hogs,
    -- suspicious names, zombie counts, thread totals, file descriptors
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

    -- ---- System Resources (9 columns) ----
    -- CPU and memory at the system level, plus swap
    system_cpu                  DOUBLE PRECISION DEFAULT 0,
    avg_core_cpu                DOUBLE PRECISION DEFAULT 0,
    system_memory_percent       DOUBLE PRECISION DEFAULT 0,
    system_memory_used          BIGINT DEFAULT 0,
    system_memory_available     BIGINT DEFAULT 0,
    system_memory_total         BIGINT DEFAULT 0,
    swap_used_percent           DOUBLE PRECISION DEFAULT 0,
    swap_total                  BIGINT DEFAULT 0,
    swap_used                   BIGINT DEFAULT 0,

    -- ---- Disk I/O (7 columns) ----
    -- Raw byte/op counts plus computed rates (bytes/sec)
    disk_read_bytes             BIGINT DEFAULT 0,
    disk_write_bytes            BIGINT DEFAULT 0,
    disk_read_rate              DOUBLE PRECISION DEFAULT 0,
    disk_write_rate             DOUBLE PRECISION DEFAULT 0,
    disk_read_count             BIGINT DEFAULT 0,
    disk_write_count            BIGINT DEFAULT 0,
    disk_io_rate                DOUBLE PRECISION DEFAULT 0,

    -- ---- User Sessions (3 columns) ----
    logged_in_users             INTEGER DEFAULT 0,
    system_uptime               BIGINT DEFAULT 0,
    system_boot_time            BIGINT DEFAULT 0,

    -- ---- Derived Host Features (2 columns) ----
    -- Delta from previous reading: positive = spike upward
    cpu_usage_spike             DOUBLE PRECISION DEFAULT 0,
    memory_usage_spike          DOUBLE PRECISION DEFAULT 0,

    -- ---- Connection State Counts (10 columns) ----
    -- TCP state machine breakdown across all connections
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

    -- ---- Interface Statistics (12 columns) ----
    -- Raw counters + computed rates from the NIC
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

    -- ---- IP Address Features (7 columns) ----
    unique_source_ips           INTEGER DEFAULT 0,
    unique_dest_ips             INTEGER DEFAULT 0,
    new_source_ips              INTEGER DEFAULT 0,
    private_ip_connections      INTEGER DEFAULT 0,
    public_ip_connections       INTEGER DEFAULT 0,
    top_source_ip_count         INTEGER DEFAULT 0,
    top_source_ip               TEXT DEFAULT '',

    -- ---- Port Features (6 columns) ----
    unique_local_ports          INTEGER DEFAULT 0,
    unique_remote_ports         INTEGER DEFAULT 0,
    well_known_port_connections INTEGER DEFAULT 0,
    ephemeral_port_connections  INTEGER DEFAULT 0,
    suspicious_port_connections INTEGER DEFAULT 0,
    port_scan_indicators        INTEGER DEFAULT 0,

    -- ---- Protocol Distribution (3 columns) ----
    tcp_ratio                   DOUBLE PRECISION DEFAULT 0,
    udp_ratio                   DOUBLE PRECISION DEFAULT 0,
    tcp_udp_ratio               DOUBLE PRECISION DEFAULT 0,

    -- ---- Process Network Activity (2 columns) ----
    processes_with_net_activity INTEGER DEFAULT 0,
    avg_connections_per_process DOUBLE PRECISION DEFAULT 0,

    -- ---- Traffic Rates (2 columns) ----
    connection_creation_rate    INTEGER DEFAULT 0,
    connection_termination_rate INTEGER DEFAULT 0,

    -- ---- Geographic/External (3 columns) ----
    external_ip_count           INTEGER DEFAULT 0,
    loopback_connections        INTEGER DEFAULT 0,
    broadcast_connections       INTEGER DEFAULT 0,

    -- ---- Derived Security Scores (7 columns) ----
    -- These are the ML-ready anomaly indicators
    connection_churn_rate       DOUBLE PRECISION DEFAULT 0,
    connection_density          DOUBLE PRECISION DEFAULT 0,
    port_scanning_score         DOUBLE PRECISION DEFAULT 0,
    data_exfiltration_score     DOUBLE PRECISION DEFAULT 0,
    bandwidth_asymmetry         DOUBLE PRECISION DEFAULT 0,
    c2_communication_score      DOUBLE PRECISION DEFAULT 0,
    failed_connection_ratio     DOUBLE PRECISION DEFAULT 0,

    -- ---- Network Map Summary (5 columns) ----
    total_incoming_connections  INTEGER DEFAULT 0,
    total_outgoing_connections  INTEGER DEFAULT 0,
    unique_incoming_ips         INTEGER DEFAULT 0,
    unique_outgoing_ips         INTEGER DEFAULT 0,
    local_ips_count             INTEGER DEFAULT 0
);

-- Convert to hypertable: auto-partitions rows into time-based chunks
-- Default chunk size is 7 days. TimescaleDB handles this internally.
SELECT create_hypertable('rihno_metrics', 'time', if_not_exists => TRUE);


-- ============================================================
-- STEP 3: Network Map Snapshots Table (rihno_network_maps)
-- ============================================================
-- Stores the full JSON network map blob each collection cycle.
-- This is large data (~10-100KB per snapshot) used for
-- deep-dive forensic investigation, not routine queries.
CREATE TABLE IF NOT EXISTS rihno_network_maps (
    time                TIMESTAMPTZ NOT NULL,
    agent_id            TEXT NOT NULL,
    email               TEXT NOT NULL,
    agent_name          TEXT NOT NULL,
    network_map_json    JSONB NOT NULL
);

SELECT create_hypertable('rihno_network_maps', 'time', if_not_exists => TRUE);


-- ============================================================
-- STEP 4: Individual Connections Table (rihno_connections)
-- ============================================================
-- Every TCP/UDP connection the agent sees gets a row here.
-- Enables queries like "show me all connections to IP X"
-- or "which processes talked to suspicious ports?"
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
    direction       TEXT NOT NULL,
    is_private      BOOLEAN DEFAULT FALSE,
    is_loopback     BOOLEAN DEFAULT FALSE,
    is_suspicious   BOOLEAN DEFAULT FALSE
);

SELECT create_hypertable('rihno_connections', 'time', if_not_exists => TRUE);


-- ============================================================
-- STEP 5: Alerts Table (rihno_alerts)
-- ============================================================
-- The dealer generates alerts when metrics cross thresholds
-- (high CPU, suspicious ports, port scanning, C2 beaconing, etc).
-- Each alert has a severity, can be acknowledged, and resolved.
CREATE TABLE IF NOT EXISTS rihno_alerts (
    id              BIGSERIAL,
    time            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agent_id        TEXT NOT NULL,
    agent_name      TEXT NOT NULL,
    email           TEXT NOT NULL,
    alert_type      TEXT NOT NULL,
    severity        TEXT NOT NULL,
    description     TEXT NOT NULL,
    metric_name     TEXT DEFAULT '',
    metric_value    DOUBLE PRECISION DEFAULT 0,
    threshold       DOUBLE PRECISION DEFAULT 0,
    acknowledged    BOOLEAN DEFAULT FALSE,
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ
);

SELECT create_hypertable('rihno_alerts', 'time', if_not_exists => TRUE);


-- ============================================================
-- STEP 6: Agent Registry Table (rihno_agents)
-- ============================================================
-- NOT a hypertable. This is a regular table with one row per agent.
-- Tracks when agents were first/last seen, whether they are active,
-- and basic identity info. Updated via UPSERT on each heartbeat.
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


-- ============================================================
-- STEP 7: Indexes
-- ============================================================
-- Without indexes, every query would scan entire hypertable chunks.
-- These indexes target the most common query patterns.

-- 7a. Metrics: lookup by agent, email, or name (all time-descending)
CREATE INDEX IF NOT EXISTS idx_metrics_agent_id
    ON rihno_metrics (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_email
    ON rihno_metrics (email, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_agent_name
    ON rihno_metrics (agent_name, time DESC);

-- 7b. Metrics: partial indexes for anomaly hunting
--     Only index rows where something suspicious actually happened.
--     Much smaller than a full index, much faster for alert dashboards.
CREATE INDEX IF NOT EXISTS idx_metrics_suspicious
    ON rihno_metrics (time DESC)
    WHERE suspicious_process_names > 0 OR suspicious_port_connections > 0;
CREATE INDEX IF NOT EXISTS idx_metrics_high_cpu
    ON rihno_metrics (time DESC)
    WHERE system_cpu > 90;

-- 7c. Network maps: lookup by agent
CREATE INDEX IF NOT EXISTS idx_netmap_agent
    ON rihno_network_maps (agent_id, time DESC);

-- 7d. Connections: agent lookup, remote IP lookup, suspicious filter
CREATE INDEX IF NOT EXISTS idx_conn_agent
    ON rihno_connections (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_conn_remote_ip
    ON rihno_connections (remote_ip, time DESC);
CREATE INDEX IF NOT EXISTS idx_conn_suspicious
    ON rihno_connections (time DESC)
    WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_conn_direction
    ON rihno_connections (direction, time DESC);

-- 7e. Alerts: agent lookup, severity filter, unresolved filter
CREATE INDEX IF NOT EXISTS idx_alerts_agent
    ON rihno_alerts (agent_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity
    ON rihno_alerts (severity, time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved
    ON rihno_alerts (time DESC)
    WHERE resolved = FALSE;

-- 7f. Agents: email and active status
CREATE INDEX IF NOT EXISTS idx_agents_email
    ON rihno_agents (email);
CREATE INDEX IF NOT EXISTS idx_agents_active
    ON rihno_agents (is_active);


-- ============================================================
-- STEP 8: Continuous Aggregates
-- ============================================================
-- Continuous aggregates are materialized views that TimescaleDB
-- keeps up-to-date automatically. Instead of computing AVG/MAX
-- over millions of raw rows at query time, the database
-- pre-computes them in the background on a schedule.

-- 8a. 1-minute rollups (for real-time dashboards)
CREATE MATERIALIZED VIEW IF NOT EXISTS rihno_metrics_1min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    agent_id,
    agent_name,
    email,
    AVG(system_cpu)                 AS avg_cpu,
    MAX(system_cpu)                 AS max_cpu,
    AVG(system_memory_percent)      AS avg_memory,
    MAX(system_memory_percent)      AS max_memory,
    AVG(total_connections)          AS avg_connections,
    MAX(total_connections)          AS max_connections,
    SUM(suspicious_port_connections) AS total_suspicious_ports,
    SUM(suspicious_process_names)   AS total_suspicious_processes,
    AVG(net_send_rate)              AS avg_net_send_rate,
    AVG(net_recv_rate)              AS avg_net_recv_rate,
    MAX(port_scanning_score)        AS max_port_scan_score,
    MAX(data_exfiltration_score)    AS max_exfil_score,
    MAX(c2_communication_score)     AS max_c2_score,
    AVG(connection_churn_rate)      AS avg_churn_rate,
    AVG(bandwidth_asymmetry)        AS avg_bandwidth_asymmetry,
    AVG(process_count)              AS avg_process_count,
    MAX(process_count)              AS max_process_count,
    AVG(disk_io_rate)               AS avg_disk_io_rate
FROM rihno_metrics
GROUP BY bucket, agent_id, agent_name, email
WITH NO DATA;

-- Refresh policy: every 1 minute, recompute the last 10 minutes.
-- The 10-minute lookback catches any late-arriving data.
SELECT add_continuous_aggregate_policy('rihno_metrics_1min',
    start_offset      => INTERVAL '10 minutes',
    end_offset        => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute',
    if_not_exists     => TRUE
);

-- 8b. 1-hour rollups (for historical dashboards and reports)
CREATE MATERIALIZED VIEW IF NOT EXISTS rihno_metrics_1hr
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    agent_id,
    agent_name,
    email,
    AVG(system_cpu)                 AS avg_cpu,
    MAX(system_cpu)                 AS max_cpu,
    MIN(system_cpu)                 AS min_cpu,
    AVG(system_memory_percent)      AS avg_memory,
    MAX(system_memory_percent)      AS max_memory,
    AVG(total_connections)          AS avg_connections,
    MAX(total_connections)          AS max_connections,
    SUM(suspicious_port_connections) AS total_suspicious_ports,
    SUM(suspicious_process_names)   AS total_suspicious_processes,
    AVG(net_send_rate)              AS avg_net_send_rate,
    AVG(net_recv_rate)              AS avg_net_recv_rate,
    MAX(port_scanning_score)        AS max_port_scan_score,
    MAX(data_exfiltration_score)    AS max_exfil_score,
    MAX(c2_communication_score)     AS max_c2_score,
    AVG(process_count)              AS avg_process_count,
    AVG(disk_io_rate)               AS avg_disk_io_rate,
    COUNT(*)                        AS sample_count
FROM rihno_metrics
GROUP BY bucket, agent_id, agent_name, email
WITH NO DATA;

SELECT add_continuous_aggregate_policy('rihno_metrics_1hr',
    start_offset      => INTERVAL '3 hours',
    end_offset        => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists     => TRUE
);


-- ============================================================
-- STEP 9: Retention Policies
-- ============================================================
-- TimescaleDB automatically drops chunks older than these intervals.
-- This prevents unbounded disk growth. Data "tiers" down:
--   raw metrics (30d) -> 1min agg (7d) -> 1hr agg (365d)

SELECT add_retention_policy('rihno_metrics',
    INTERVAL '30 days', if_not_exists => TRUE);

SELECT add_retention_policy('rihno_network_maps',
    INTERVAL '7 days', if_not_exists => TRUE);

SELECT add_retention_policy('rihno_connections',
    INTERVAL '7 days', if_not_exists => TRUE);

SELECT add_retention_policy('rihno_alerts',
    INTERVAL '90 days', if_not_exists => TRUE);

SELECT add_retention_policy('rihno_metrics_1min',
    INTERVAL '7 days', if_not_exists => TRUE);

SELECT add_retention_policy('rihno_metrics_1hr',
    INTERVAL '365 days', if_not_exists => TRUE);


-- ============================================================
-- STEP 10: Compression Policies
-- ============================================================
-- After 2 days, raw data is rarely queried row-by-row.
-- TimescaleDB compresses old chunks using columnar compression,
-- typically achieving 10-20x compression ratio.
-- Data remains fully queryable — decompression is transparent.

ALTER TABLE rihno_metrics SET (
    timescaledb.compress,
    timescaledb.compress_segmentby  = 'agent_id',
    timescaledb.compress_orderby    = 'time DESC'
);

SELECT add_compression_policy('rihno_metrics',
    INTERVAL '2 days', if_not_exists => TRUE);

ALTER TABLE rihno_connections SET (
    timescaledb.compress,
    timescaledb.compress_segmentby  = 'agent_id',
    timescaledb.compress_orderby    = 'time DESC'
);

SELECT add_compression_policy('rihno_connections',
    INTERVAL '2 days', if_not_exists => TRUE);
```

---

# README: Schema Setup Guide

## Prerequisites

| Requirement | Minimum Version | Purpose |
|---|---|---|
| PostgreSQL | 14+ | Base database |
| TimescaleDB | 2.10+ | Time-series extension |
| psql | any | CLI to run the schema |

```bash
# Verify TimescaleDB is installed
psql -U postgres -c "SELECT default_version FROM pg_available_extensions WHERE name = 'timescaledb';"
```

---

## Step-by-Step Explanation

### Step 1 — Enable TimescaleDB

```
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

TimescaleDB is a PostgreSQL extension, not a separate database. This single command activates it. Every feature below (hypertables, compression, retention, continuous aggregates) depends on this extension being present. Run it once per database.

---

### Step 2 — Create `rihno_metrics` (Main Table)

This is the heart of the system. Every 10 seconds, each RIHNO agent collects a snapshot of **92 metrics** spanning:

```
5 identity columns (time, agent_id, email, agent_name, agent_type)
├── 16 process features      (counts, CPU/mem averages, suspicious names)
├──  9 system resources       (CPU, memory, swap)
├──  7 disk I/O               (bytes, rates, operation counts)
├──  3 user sessions          (logged-in users, uptime, boot time)
├──  2 derived host scores    (CPU spike, memory spike)
├── 10 connection states      (ESTABLISHED, LISTEN, SYN_SENT, etc.)
├── 12 interface statistics   (bytes/packets sent/recv, errors, drops, rates)
├──  7 IP address features    (unique IPs, private/public split)
├──  6 port features          (well-known, ephemeral, suspicious)
├──  3 protocol distribution  (TCP/UDP ratios)
├──  2 process-network        (processes with sockets, avg conns/process)
├──  2 traffic rates          (connection creation/termination)
├──  3 geographic             (external, loopback, broadcast)
├──  7 security scores        (port scan, exfiltration, C2, churn)
└──  5 network map summary    (incoming/outgoing counts)
```

After creation, `create_hypertable()` converts it from a regular PostgreSQL table into a TimescaleDB hypertable. Internally this means:

- Data is auto-partitioned into **chunks** by time (default 7-day chunks)
- Queries with `WHERE time > NOW() - INTERVAL '1 hour'` only scan the relevant chunk
- Compression and retention operate on whole chunks, not individual rows

---

### Step 3 — Create `rihno_network_maps`

Each collection cycle, the agent builds a full JSON map of every IPv4 connection: remote IP, port, process name, direction, whether it's suspicious. This JSON blob is stored as `JSONB` for:

- **Forensic investigation**: "What was the full connection state at 3:42 AM?"
- **JSONB queries**: PostgreSQL can query inside the JSON (`network_map_json->>'connections'`)
- **Short retention**: 7 days only, because each snapshot is 10-100KB

---

### Step 4 — Create `rihno_connections`

Flattened version of the network map. One row per connection per collection cycle. This enables relational queries that would be awkward with JSONB:

```sql
-- Example: Find all connections to a specific IP in the last hour
SELECT * FROM rihno_connections
WHERE remote_ip = '203.0.113.50'
  AND time > NOW() - INTERVAL '1 hour';
```

The `is_suspicious` boolean flag is set by the agent when a connection uses a known-bad port (4444, 31337, 6667, etc.).

---

### Step 5 — Create `rihno_alerts`

The dealer generates alerts when metrics cross hardcoded thresholds:

| Alert Type | Severity | Trigger |
|---|---|---|
| `HIGH_CPU` | high | `system_cpu > 95%` |
| `HIGH_MEMORY` | high | `system_memory_percent > 95%` |
| `SUSPICIOUS_PORTS` | critical | `suspicious_port_connections > 0` |
| `SUSPICIOUS_PROCESSES` | critical | `suspicious_process_names > 0` |
| `PORT_SCAN` | high | `port_scanning_score > 50` |
| `DATA_EXFILTRATION` | critical | `data_exfiltration_score > 50` |
| `C2_COMMUNICATION` | critical | `c2_communication_score > 70` |
| `HIGH_CONN_CHURN` | medium | `connection_churn_rate > 0.8` |
| `SYN_FLOOD` | high | `syn_sent_connections > 100` |
| `HIGH_FAILED_CONNECTIONS` | medium | `failed_connection_ratio > 0.5` |

Each alert can be `acknowledged` and `resolved` through a future API/dashboard.

---

### Step 6 — Create `rihno_agents`

This is a **regular table** (not a hypertable) because it has one row per agent, updated via `UPSERT`:

```sql
INSERT INTO rihno_agents (...) VALUES (...)
ON CONFLICT (agent_id) DO UPDATE SET last_seen = NOW(), is_active = TRUE;
```

It serves as the agent registry for dashboards: "How many agents are online? When was agent X last seen?"

---

### Step 7 — Create Indexes

Indexes are critical for query performance. Without them, every query scans full chunks.

**Standard indexes** cover the three most common lookup patterns:
- By `agent_id` (show me this agent's history)
- By `email` (show me all agents for this user)
- By `agent_name` (show me this named agent)

**Partial indexes** are the key optimization. They only index rows matching a `WHERE` clause:

```sql
-- This index only contains rows where something suspicious happened.
-- If 99% of rows are clean, this index is 100x smaller than a full index.
CREATE INDEX idx_metrics_suspicious ON rihno_metrics (time DESC)
    WHERE suspicious_process_names > 0 OR suspicious_port_connections > 0;
```

---

### Step 8 — Create Continuous Aggregates

The raw `rihno_metrics` table gets ~8,640 rows per agent per day (one every 10 seconds). Dashboards don't need 10-second granularity for "last 24 hours" charts.

Continuous aggregates are **automatically maintained materialized views**:

```
Raw data (10s intervals)
    │
    ├── rihno_metrics_1min   (refreshed every 1 minute)
    │   └── AVG/MAX/SUM of key metrics per minute
    │
    └── rihno_metrics_1hr    (refreshed every 1 hour)
        └── AVG/MAX/MIN/SUM/COUNT per hour
```

**Key detail**: `WITH NO DATA` means TimescaleDB doesn't backfill historical data on creation. It starts aggregating from the moment the policy kicks in. To backfill existing data:

```sql
CALL refresh_continuous_aggregate('rihno_metrics_1min', NULL, NULL);
```

---

### Step 9 — Retention Policies

TimescaleDB drops entire chunks (not individual rows) when they exceed the retention window. This is an O(1) operation — it deletes the chunk file, no row-by-row scanning.

```
Data Lifecycle:
                                                    
  Raw metrics ──── 30 days ────> DROPPED            
  Network maps ─── 7 days ─────> DROPPED            
  Connections ──── 7 days ─────> DROPPED            
  Alerts ───────── 90 days ────> DROPPED            
  1-min aggregates 7 days ─────> DROPPED            
  1-hr aggregates  365 days ───> DROPPED            
```

The tiered approach means:
- **Last 7 days**: Full 10-second resolution + connection details + network maps
- **Last 30 days**: 10-second resolution metrics (no connections/maps)
- **Last 7 days**: 1-minute aggregated dashboards
- **Last 365 days**: 1-hour aggregated trend analysis

---

### Step 10 — Compression Policies

After 2 days, raw data is unlikely to be queried at full granularity. TimescaleDB compresses old chunks using **columnar compression**:

- Typical compression ratio: **10-20x**
- Data remains **fully queryable** (transparent decompression)
- `compress_segmentby = 'agent_id'` means data for one agent is stored contiguously
- `compress_orderby = 'time DESC'` optimizes for "most recent first" queries

```
Day 0-2:   Uncompressed (fast writes, fast reads)
Day 2-30:  Compressed (slower writes blocked, reads slightly slower, 90% less disk)
Day 30+:   Dropped by retention policy
```

---

## Running the Schema

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE rihno_db;"

# 2. Run the schema file
psql -U postgres -d rihno_db -f schema.sql

# 3. Verify everything was created
psql -U postgres -d rihno_db -c "
SELECT hypertable_name, num_chunks, compression_enabled
FROM timescaledb_information.hypertables;
"
```

Expected output:

```
  hypertable_name  | num_chunks | compression_enabled
-------------------+------------+--------------------
 rihno_metrics     |          0 | t
 rihno_network_maps|          0 | f
 rihno_connections |          0 | t
 rihno_alerts      |          0 | f
```

```bash
# 4. Verify policies are active
psql -U postgres -d rihno_db -c "
SELECT application_name, schedule_interval, config
FROM timescaledb_information.jobs
WHERE application_name LIKE '%rihno%' OR hypertable_name LIKE '%rihno%';
"
```

---

## Disk Usage Estimation

| Table | Per Agent Per Day | 10 Agents / 30 Days |
|---|---|---|
| `rihno_metrics` | ~3.5 MB raw, ~350 KB compressed | ~105 MB |
| `rihno_connections` | ~50 MB raw (varies), ~5 MB compressed | ~150 MB |
| `rihno_network_maps` | ~100 MB raw (7-day retention) | ~1 GB |
| `rihno_alerts` | negligible | negligible |
| `rihno_metrics_1min` | ~50 KB | ~15 MB |
| `rihno_metrics_1hr` | ~1 KB | ~300 KB |
| **Total** | — | **~1.3 GB** |