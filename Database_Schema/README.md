# RIHNO Database Schema - Complete Explanation

## Overview
RIHNO uses TimescaleDB (PostgreSQL extension) for efficient time-series storage. The database tracks host metrics, network connections, and security alerts from distributed agents.

---

## TABLE DESCRIPTIONS

### 1. **rihno_metrics** (Main Metrics Table)
**Type:** TimescaleDB Hypertable (time-series optimized)  
**Retention:** 30 days (automatically compressed after 2 days)  
**Data Frequency:** Every 10 seconds per agent

#### Purpose
Stores snapshots of 99 host and network metrics from each agent. Each row represents a single agent's metrics at a specific moment in time.

#### Key Columns

**Identity Columns (5):**
- `time` - Timestamp of the metrics snapshot (TIMESTAMPTZ, NOT NULL)
- `agent_id` - Unique identifier for the agent (TEXT)
- `email` - Email of the account owning this agent (TEXT)
- `agent_name` - Human-readable agent name (TEXT)
- `agent_type` - Type of agent (e.g., "server", "workstation", "cloud") (TEXT)

**Process Features (16 columns):**
- `process_count` - Total number of processes running
- `process_creation_rate` - New processes spawned per interval
- `process_termination_rate` - Processes terminated per interval
- `high_cpu_process_count` - Processes consuming >50% CPU
- `high_mem_process_count` - Processes consuming >50% memory
- `avg_process_cpu` - Average CPU % per process
- `avg_process_memory` - Average memory % per process
- `avg_process_rss` - Average resident memory size
- `avg_process_vms` - Average virtual memory size
- `total_threads` - Sum of all threads across processes
- `zombie_process_count` - Dead processes not yet reaped
- `root_process_count` - Processes running as root
- `avg_process_age_seconds` - Average process uptime
- `process_with_many_threads` - Processes with >10 threads
- `suspicious_process_names` - Count of suspicious process names detected
- `total_file_descriptors` - Total open file handles

**System Resources (9 columns):**
- `system_cpu` - Overall system CPU usage percentage
- `avg_core_cpu` - Average per-core CPU usage
- `system_memory_percent` - Overall memory utilization %
- `system_memory_used` - Memory in use (bytes)
- `system_memory_available` - Free memory (bytes)
- `system_memory_total` - Total system memory (bytes)
- `swap_used_percent` - Swap space utilization %
- `swap_total` - Total swap available (bytes)
- `swap_used` - Swap currently in use (bytes)

**Disk I/O (7 columns):**
- `disk_read_bytes` - Total bytes read from disk
- `disk_write_bytes` - Total bytes written to disk
- `disk_read_rate` - Read speed (bytes/sec)
- `disk_write_rate` - Write speed (bytes/sec)
- `disk_read_count` - Number of read operations
- `disk_write_count` - Number of write operations
- `disk_io_rate` - Combined I/O rate (bytes/sec)

**User Sessions (3 columns):**
- `logged_in_users` - Count of active user sessions
- `system_uptime` - System uptime in seconds
- `system_boot_time` - Last boot timestamp

**Derived Features (2 columns - spike detection):**
- `cpu_usage_spike` - CPU change from previous reading (anomaly indicator)
- `memory_usage_spike` - Memory change from previous reading

**Connection States (10 columns):**
- `total_connections` - Total active connections
- `tcp_connections` - TCP connections
- `udp_connections` - UDP connections
- `established_connections` - ESTABLISHED state connections
- `listen_connections` - LISTEN state (server listening)
- `time_wait_connections` - TIME_WAIT state
- `syn_sent_connections` - SYN_SENT state (suspicious if high)
- `syn_recv_connections` - SYN_RECV state
- `close_wait_connections` - CLOSE_WAIT state
- `fin_wait_connections` - FIN_WAIT state

**Network Interface Statistics (12 columns):**
- `net_bytes_sent` - Total bytes transmitted
- `net_bytes_recv` - Total bytes received
- `net_packets_sent` - Packets sent
- `net_packets_recv` - Packets received
- `net_errors_in` - Incoming errors
- `net_errors_out` - Outgoing errors
- `net_drops_in` - Packets dropped on receive
- `net_drops_out` - Packets dropped on transmit
- `net_send_rate` - Upload speed (bytes/sec)
- `net_recv_rate` - Download speed (bytes/sec)
- `net_packet_send_rate` - Packets/sec sent
- `net_packet_recv_rate` - Packets/sec received

**IP Address Features (7 columns):**
- `unique_source_ips` - Unique local IPs
- `unique_dest_ips` - Unique remote IPs contacted
- `new_source_ips` - New IPs since last reading
- `private_ip_connections` - Connections to private ranges
- `public_ip_connections` - Connections to public IPs
- `top_source_ip_count` - Most common source IP count
- `top_source_ip` - The most frequently used IP

**Port Features (6 columns):**
- `unique_local_ports` - Unique listening ports
- `unique_remote_ports` - Unique remote ports connected to
- `well_known_port_connections` - Connections on ports <1024
- `ephemeral_port_connections` - Connections on high ports
- `suspicious_port_connections` - Connections on known malware ports
- `port_scan_indicators` - Signs of port scanning activity

**Protocol Distribution (3 columns):**
- `tcp_ratio` - % of connections that are TCP
- `udp_ratio` - % of connections that are UDP
- `tcp_udp_ratio` - TCP:UDP ratio

**Process Network Activity (2 columns):**
- `processes_with_net_activity` - How many processes are networking
- `avg_connections_per_process` - Average connections per process

**Traffic Rates (2 columns):**
- `connection_creation_rate` - New connections per interval
- `connection_termination_rate` - Closed connections per interval

**Geographic/External (3 columns):**
- `external_ip_count` - Unique external IPs contacted
- `loopback_connections` - Connections to 127.x.x.x
- `broadcast_connections` - Broadcast traffic

**Security Scores (7 columns - ML-ready anomaly indicators):**
- `connection_churn_rate` - (create+terminate) / total (0=stable, 1=chaotic)
- `connection_density` - connections / processes (higher=more aggressive)
- `port_scanning_score` - 0-100 probability of port scan activity
- `data_exfiltration_score` - 0-100 probability of data theft
- `bandwidth_asymmetry` - 0-1 ratio of send vs receive imbalance
- `c2_communication_score` - 0-100 probability of C2 beaconing
- `failed_connection_ratio` - % of connections that failed

**Network Map Summary (5 columns):**
- `total_incoming_connections` - Inbound connections
- `total_outgoing_connections` - Outbound connections
- `unique_incoming_ips` - Unique remote IPs connecting in
- `unique_outgoing_ips` - Unique remote IPs connected to
- `local_ips_count` - Number of local IPs on the device

#### Use Cases
- Real-time system health monitoring
- Trend analysis over hours/days
- Anomaly detection (spikes in CPU, memory, connections)
- Security investigation (find unusual network behavior)
- Performance baselines

---

### 2. **rihno_network_maps** (Network Topology Snapshots)
**Type:** TimescaleDB Hypertable  
**Retention:** 7 days  
**Data Frequency:** Every 10 seconds per agent

#### Purpose
Stores the complete network topology snapshot as JSON. Contains all active connections with full details needed for forensic investigation.

#### Key Columns
- `time` - Snapshot timestamp (TIMESTAMPTZ, NOT NULL)
- `agent_id` - Which agent sent this data (TEXT)
- `email` - Email of account owner (TEXT)
- `agent_name` - Agent name (TEXT)
- `network_map_json` - Complete JSON blob with connections array

#### JSON Structure
```json
{
  "connections": [
    {
      "remote_ip": "192.168.1.100",
      "remote_port": 443,
      "local_ip": "10.0.0.50",
      "local_port": 54321,
      "protocol": "TCP",
      "state": "ESTABLISHED",
      "pid": 1234,
      "process_name": "chrome.exe",
      "direction": "outgoing",
      "is_private": true,
      "is_loopback": false,
      "is_suspicious": false
    }
  ],
  "local_ips": ["10.0.0.50", "172.17.0.1"]
}
```

#### Use Cases
- Deep forensic investigation of specific time window
- Network reconstruction for incident response
- Process-to-connection mapping analysis
- Export for external security tools

---

### 3. **rihno_connections** (Individual Connection Records)
**Type:** TimescaleDB Hypertable  
**Retention:** 7 days  
**Data Frequency:** One row per connection per interval

#### Purpose
Denormalized connection table for fast queries. Each row is a single TCP/UDP connection observed by the agent. Enables queries like "all connections to port 4444" or "all suspicious connections".

#### Key Columns
- `time` - When this connection was observed (TIMESTAMPTZ)
- `agent_id` - Source agent (TEXT)
- `agent_name` - Agent name (TEXT)
- `remote_ip` - Remote/destination IP (TEXT)
- `remote_port` - Remote port number (INTEGER)
- `local_ip` - Local/source IP (TEXT)
- `local_port` - Local port number (INTEGER)
- `protocol` - TCP or UDP (TEXT)
- `state` - Connection state (ESTABLISHED, LISTEN, SYN_SENT, etc.)
- `pid` - Process ID owning the connection (INTEGER)
- `process_name` - Name of the process (TEXT)
- `direction` - "incoming" or "outgoing" (TEXT)
- `is_private` - True if remote IP is in private range (BOOLEAN)
- `is_loopback` - True if connection is to localhost (BOOLEAN)
- `is_suspicious` - True if port is known-malicious (BOOLEAN)

#### Use Cases
- Find all connections to a specific IP
- List all suspicious port connections
- Identify compromised processes
- Network forensics for specific time periods
- Process behavior analysis

---

### 4. **rihno_alerts** (Security Alerts)
**Type:** TimescaleDB Hypertable  
**Retention:** 90 days  
**Data Frequency:** Only when thresholds are crossed

#### Purpose
Records security alerts generated when metrics exceed thresholds. Examples: CPU >95%, suspicious ports detected, port scanning detected, C2 beaconing, data exfiltration.

#### Key Columns
- `id` - Auto-incrementing alert ID (BIGSERIAL)
- `time` - When alert was triggered (TIMESTAMPTZ, default NOW())
- `agent_id` - Source agent (TEXT)
- `agent_name` - Agent name (TEXT)
- `email` - Account email (TEXT)
- `alert_type` - Type of alert (HIGH_CPU, SUSPICIOUS_PORTS, PORT_SCAN, DATA_EXFILTRATION, C2_COMMUNICATION, etc.)
- `severity` - Alert level: "low", "medium", "high", "critical" (TEXT)
- `description` - Human-readable alert message (TEXT)
- `metric_name` - Which metric triggered it (system_cpu, port_scanning_score, etc.)
- `metric_value` - Actual value that triggered alert (DOUBLE PRECISION)
- `threshold` - Threshold that was exceeded (DOUBLE PRECISION)
- `acknowledged` - Whether analyst has reviewed it (BOOLEAN)
- `resolved` - Whether the issue is fixed (BOOLEAN)
- `resolved_at` - When it was resolved (TIMESTAMPTZ)

#### Alert Types (from main.go)
- `HIGH_CPU` - System CPU > 95%
- `HIGH_MEMORY` - Memory usage > 95%
- `SUSPICIOUS_PORTS` - Connections on malware ports
- `SUSPICIOUS_PROCESSES` - Known malware process names
- `PORT_SCAN` - Port scanning score > 50
- `DATA_EXFILTRATION` - Data exfil score > 50
- `C2_COMMUNICATION` - C2 communication score > 70
- `HIGH_CONN_CHURN` - Connection churn > 0.8
- `SYN_FLOOD` - SYN_SENT connections > 100
- `HIGH_FAILED_CONNECTIONS` - Failed connection ratio > 0.5

#### Use Cases
- Alert dashboard and incident tracking
- Trend analysis of alerts over time
- Agent health status
- Security incident investigation
- SLA/compliance reporting

---

### 5. **rihno_agents** (Agent Registry)
**Type:** Regular PostgreSQL Table (NOT a hypertable)  
**Retention:** Forever (one row per agent)  
**Update Frequency:** On each agent heartbeat

#### Purpose
Tracks metadata about each agent. Single source of truth for agent information. Updated via UPSERT on every metrics transmission.

#### Key Columns
- `agent_id` - Unique agent identifier (TEXT, PRIMARY KEY)
- `agent_name` - Human-friendly name (TEXT)
- `agent_type` - Type of agent: "server", "workstation", "cloud", etc. (TEXT)
- `email` - Owner's email address (TEXT)
- `first_seen` - When agent first connected (TIMESTAMPTZ, default NOW())
- `last_seen` - When agent last sent data (TIMESTAMPTZ, default NOW())
- `is_active` - Currently active/alive (BOOLEAN, default TRUE)
- `os_info` - Operating system info (TEXT)
- `ip_address` - Last known IP address (TEXT)

#### Use Cases
- Agent health status and availability
- Agent discovery and inventory
- Filtering metrics by organization/email
- Agent lifecycle management
- Last-seen monitoring

---

### 6. **rihno_metrics_1min** (1-Minute Aggregation)
**Type:** TimescaleDB Materialized Continuous Aggregate View  
**Retention:** 7 days  
**Auto-Refresh:** Every 1 minute

#### Purpose
Pre-computed 1-minute averages and maximums of key metrics. Much faster than raw metrics for dashboards and real-time monitoring. Automatically maintained by TimescaleDB.

#### Key Columns
- `bucket` - 1-minute time bucket
- `agent_id` - Agent identifier
- `agent_name` - Agent name
- `email` - Owner email
- `avg_cpu`, `max_cpu` - CPU statistics
- `avg_memory`, `max_memory` - Memory statistics
- `avg_connections`, `max_connections` - Connection counts
- `total_suspicious_ports` - Count of suspicious port connections in the minute
- `total_suspicious_processes` - Count of suspicious process detections
- `avg_net_send_rate`, `avg_net_recv_rate` - Network speeds
- `max_port_scan_score` - Highest port scanning score in minute
- `max_exfil_score` - Highest data exfiltration score
- `max_c2_score` - Highest C2 score
- `avg_churn_rate` - Average connection churn
- `avg_bandwidth_asymmetry` - Average traffic imbalance
- `avg_process_count`, `max_process_count` - Process counts
- `avg_disk_io_rate` - Disk I/O statistics

#### Use Cases
- Real-time dashboards
- 1-minute granularity trending
- Alert dashboard (faster queries)
- SLA monitoring
- Quick incident detection

---

### 7. **rihno_metrics_1hr** (1-Hour Aggregation)
**Type:** TimescaleDB Materialized Continuous Aggregate View  
**Retention:** 365 days  
**Auto-Refresh:** Every 1 hour

#### Purpose
Pre-computed hourly statistics. Longest retention for historical analysis and trend reporting. Enables yearly trend analysis.

#### Key Columns (Similar to 1min view, but includes):
- `bucket` - 1-hour time bucket
- `min_cpu` - Minimum CPU in the hour (not in 1min view)
- `sample_count` - Number of raw samples aggregated
- All other columns same as 1min view

#### Use Cases
- Historical trend analysis
- Week/month/year trend reports
- Capacity planning
- Long-term performance baselines
- Cost/efficiency analysis

---

## INDEXES

### Hypertable Indexes (Time-Series Optimized)

**Metrics Table:**
- `idx_metrics_agent_id` - Lookup by agent (agent_id, time DESC)
- `idx_metrics_email` - Lookup by email (email, time DESC)
- `idx_metrics_agent_name` - Lookup by agent name (agent_name, time DESC)
- `idx_metrics_suspicious` - Partial: only rows with suspicious activity
- `idx_metrics_high_cpu` - Partial: only rows with CPU > 90%

**Connections Table:**
- `idx_conn_agent` - Lookup connections by agent
- `idx_conn_remote_ip` - Find all connections to/from an IP
- `idx_conn_suspicious` - Partial: suspicious connections only
- `idx_conn_direction` - Filter by incoming/outgoing

**Alerts Table:**
- `idx_alerts_agent` - Lookup alerts by agent
- `idx_alerts_severity` - Filter by alert severity
- `idx_alerts_unresolved` - Partial: unresolved alerts only

**Network Maps Table:**
- `idx_netmap_agent` - Lookup network maps by agent

**Agents Table:**
- `idx_agents_email` - Find agents by email
- `idx_agents_active` - Find active/inactive agents

---

## COMPRESSION & RETENTION

The database automatically manages data lifecycle:

| Table | Raw Retention | Aggregation | Compression |
|-------|---------------|-------------|-------------|
| rihno_metrics | 30 days | → 1min (7d), 1hr (365d) | After 2 days |
| rihno_network_maps | 7 days | - | After 2 days |
| rihno_connections | 7 days | - | After 2 days |
| rihno_alerts | 90 days | - | - |
| rihno_agents | Forever | - | - |

Compression achieves 10-20x space savings while keeping data queryable.
