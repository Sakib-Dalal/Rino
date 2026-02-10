# RIHNO Database Schema



https://dbdocs.io/sakibdalal73/RIHNO

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