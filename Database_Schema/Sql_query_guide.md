# SQL Queries for RIHNO Metrics Retrieval

This document provides ready-to-use SQL queries to retrieve metrics based on:
- **Email** - Account/owner email
- **Agent Name** (Device Name) - The human-readable device name
- **Agent Type** (Device Type) - Type of device (server, workstation, cloud, etc.)

---

## SECTION 1: BASIC QUERIES - GET LATEST METRICS

### 1.1 Get Latest Metrics for a Specific Email
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    tcp_connections,
    udp_connections,
    suspicious_port_connections,
    suspicious_process_names,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score
FROM rihno_metrics
WHERE email = 'user@example.com'
ORDER BY time DESC
LIMIT 10;  -- Last 10 snapshots
```

### 1.2 Get Latest Metrics for a Specific Device Name
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    suspicious_port_connections,
    port_scanning_score,
    data_exfiltration_score
FROM rihno_metrics
WHERE agent_name = 'DESKTOP-WORKSTATION-01'
ORDER BY time DESC
LIMIT 10;
```

### 1.3 Get Latest Metrics for a Specific Device Type
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    suspicious_port_connections,
    port_scanning_score
FROM rihno_metrics
WHERE agent_type = 'server'
ORDER BY time DESC
LIMIT 100;  -- Latest 100 snapshots across all servers
```

### 1.4 Most Recent Single Snapshot Per Device for an Email
```sql
SELECT DISTINCT ON (agent_id)
    agent_id,
    agent_name,
    agent_type,
    email,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    suspicious_port_connections,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score
FROM rihno_metrics
WHERE email = 'user@example.com'
ORDER BY agent_id, time DESC;
```

---

## SECTION 2: TIME-RANGE QUERIES

### 2.1 Get All Metrics for Email Within Last 24 Hours
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    suspicious_port_connections,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score,
    bandwidth_asymmetry
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;
```

### 2.2 Get All Metrics for Device Between Two Timestamps
```sql
SELECT 
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    tcp_connections,
    udp_connections,
    established_connections,
    listen_connections,
    net_send_rate,
    net_recv_rate,
    disk_io_rate,
    port_scanning_score
FROM rihno_metrics
WHERE agent_name = 'PROD-SERVER-01'
  AND time >= '2026-02-11 00:00:00'::TIMESTAMPTZ
  AND time <= '2026-02-11 23:59:59'::TIMESTAMPTZ
ORDER BY time ASC;
```

### 2.3 Get All Metrics for Device Type in Last 7 Days
```sql
SELECT 
    agent_id,
    agent_name,
    time,
    system_cpu,
    system_memory_percent,
    total_connections,
    suspicious_port_connections,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score
FROM rihno_metrics
WHERE agent_type = 'workstation'
  AND time > NOW() - INTERVAL '7 days'
ORDER BY agent_name, time DESC;
```

---

## SECTION 3: AGGREGATION & STATISTICS

### 3.1 Average Metrics Over Last 24 Hours for Email
```sql
SELECT 
    agent_name,
    agent_type,
    COUNT(*) as sample_count,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_memory,
    ROUND(MAX(system_memory_percent)::NUMERIC, 2) as max_memory,
    ROUND(AVG(total_connections)::NUMERIC, 1) as avg_connections,
    ROUND(MAX(total_connections)::NUMERIC, 1) as max_connections,
    ROUND(AVG(net_send_rate)::NUMERIC, 0) as avg_upload_bytes_sec,
    ROUND(AVG(net_recv_rate)::NUMERIC, 0) as avg_download_bytes_sec,
    ROUND(AVG(port_scanning_score)::NUMERIC, 2) as avg_port_scan_score,
    ROUND(AVG(data_exfiltration_score)::NUMERIC, 2) as avg_exfil_score,
    ROUND(AVG(c2_communication_score)::NUMERIC, 2) as avg_c2_score
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, agent_type
ORDER BY avg_cpu DESC;
```

### 3.2 Hourly Statistics for Device Name
```sql
SELECT 
    time_bucket('1 hour', time) as hour,
    COUNT(*) as samples_per_hour,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_memory,
    ROUND(MAX(total_connections)::NUMERIC, 1) as max_connections,
    ROUND(AVG(port_scanning_score)::NUMERIC, 2) as avg_port_scan_score
FROM rihno_metrics
WHERE agent_name = 'PROD-SERVER-01'
  AND time > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

### 3.3 Per-Device Summary for Device Type (Last 24 Hours)
```sql
SELECT 
    agent_name,
    agent_type,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_memory,
    ROUND(AVG(total_connections)::NUMERIC, 1) as avg_connections,
    COUNT(CASE WHEN system_cpu > 90 THEN 1 END) as high_cpu_samples,
    COUNT(CASE WHEN system_memory_percent > 95 THEN 1 END) as high_memory_samples,
    COUNT(CASE WHEN suspicious_port_connections > 0 THEN 1 END) as samples_with_suspicious_ports,
    COUNT(CASE WHEN port_scanning_score > 50 THEN 1 END) as samples_with_port_scanning,
    COUNT(CASE WHEN data_exfiltration_score > 50 THEN 1 END) as samples_with_exfil,
    COUNT(*) as total_samples
FROM rihno_metrics
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, agent_type
ORDER BY avg_cpu DESC;
```

---

## SECTION 4: ANOMALY & SECURITY DETECTION

### 4.1 Find Security Anomalies for Email (Last 24 Hours)
```sql
SELECT 
    agent_name,
    agent_type,
    time,
    system_cpu,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score,
    bandwidth_asymmetry,
    suspicious_port_connections,
    suspicious_process_names
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
  AND (
    port_scanning_score > 50
    OR data_exfiltration_score > 50
    OR c2_communication_score > 70
    OR bandwidth_asymmetry > 0.8
    OR suspicious_port_connections > 0
    OR suspicious_process_names > 0
  )
ORDER BY time DESC;
```

### 4.2 Find High CPU/Memory Events for Device Name (Last 7 Days)
```sql
SELECT 
    time,
    system_cpu,
    system_memory_percent,
    process_count,
    total_connections,
    high_cpu_process_count,
    high_mem_process_count
FROM rihno_metrics
WHERE agent_name = 'WORKSTATION-01'
  AND time > NOW() - INTERVAL '7 days'
  AND (system_cpu > 90 OR system_memory_percent > 90)
ORDER BY time DESC;
```

### 4.3 Detect Port Scanning Activity by Device Type
```sql
SELECT 
    agent_id,
    agent_name,
    time,
    port_scan_indicators,
    port_scanning_score,
    syn_sent_connections,
    unique_remote_ports,
    process_count
FROM rihno_metrics
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
  AND (
    port_scanning_score > 30
    OR syn_sent_connections > 50
  )
ORDER BY port_scanning_score DESC;
```

### 4.4 Detect Data Exfiltration Patterns
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    time,
    net_send_rate,
    net_recv_rate,
    data_exfiltration_score,
    bandwidth_asymmetry,
    total_outgoing_connections,
    unique_outgoing_ips,
    connection_creation_rate
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
  AND (
    data_exfiltration_score > 40
    OR (net_send_rate > 10000000 AND bandwidth_asymmetry > 0.7)
  )
ORDER BY data_exfiltration_score DESC;
```

### 4.5 Detect C2 (Command & Control) Communication
```sql
SELECT 
    agent_id,
    agent_name,
    time,
    c2_communication_score,
    connection_churn_rate,
    established_connections,
    connection_creation_rate,
    connection_termination_rate
FROM rihno_metrics
WHERE agent_type = 'workstation'
  AND time > NOW() - INTERVAL '48 hours'
  AND c2_communication_score > 60
ORDER BY c2_communication_score DESC;
```

---

## SECTION 5: ALERTS & INCIDENTS

### 5.1 Get All Unresolved Alerts for Email
```sql
SELECT 
    id,
    time,
    agent_name,
    alert_type,
    severity,
    description,
    metric_name,
    metric_value,
    threshold,
    acknowledged
FROM rihno_alerts
WHERE email = 'user@example.com'
  AND resolved = FALSE
ORDER BY severity DESC, time DESC;
```

### 5.2 Get Critical Alerts for Device Name (Last 7 Days)
```sql
SELECT 
    time,
    alert_type,
    severity,
    description,
    metric_value,
    threshold
FROM rihno_alerts
WHERE agent_name = 'PROD-SERVER-01'
  AND time > NOW() - INTERVAL '7 days'
  AND severity IN ('critical', 'high')
ORDER BY time DESC;
```

### 5.3 Alert Summary by Device Type
```sql
SELECT 
    agent_name,
    alert_type,
    severity,
    COUNT(*) as alert_count,
    COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_count,
    COUNT(CASE WHEN acknowledged = FALSE THEN 1 END) as unacknowledged_count
FROM rihno_alerts
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, alert_type, severity
ORDER BY alert_count DESC;
```

### 5.4 Timeline of Alerts for Incident Investigation
```sql
SELECT 
    time,
    agent_name,
    alert_type,
    severity,
    description,
    metric_name,
    metric_value,
    threshold
FROM rihno_alerts
WHERE agent_name = 'COMPROMISED-DEVICE'
  AND time > NOW() - INTERVAL '72 hours'
ORDER BY time ASC;
```

---

## SECTION 6: NETWORK ANALYSIS

### 6.1 Get Connection Summary for Email
```sql
SELECT 
    agent_name,
    agent_type,
    time,
    total_connections,
    tcp_connections,
    udp_connections,
    established_connections,
    listen_connections,
    unique_source_ips,
    unique_dest_ips,
    external_ip_count,
    private_ip_connections,
    public_ip_connections
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;
```

### 6.2 Find Suspicious Network Connections for Device
```sql
SELECT 
    c.time,
    c.remote_ip,
    c.remote_port,
    c.local_port,
    c.protocol,
    c.process_name,
    c.direction,
    c.is_suspicious
FROM rihno_connections c
WHERE c.agent_name = 'WORKSTATION-01'
  AND c.time > NOW() - INTERVAL '24 hours'
  AND (
    c.is_suspicious = TRUE
    OR c.remote_port IN (4444, 5555, 6666, 1337, 31337)
  )
ORDER BY c.time DESC;
```

### 6.3 Analyze Traffic Direction by Device Type
```sql
SELECT 
    agent_name,
    direction,
    protocol,
    COUNT(*) as connection_count,
    COUNT(DISTINCT remote_ip) as unique_ips,
    ARRAY_AGG(DISTINCT remote_port ORDER BY remote_port)::TEXT as remote_ports
FROM rihno_connections
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, direction, protocol
ORDER BY agent_name, direction;
```

### 6.4 Extract Network Map for Investigation
```sql
SELECT 
    agent_name,
    time,
    network_map_json
FROM rihno_network_maps
WHERE agent_name = 'SUSPECT-DEVICE'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC
LIMIT 5;  -- Last 5 snapshots
```

---

## SECTION 7: PROCESS ANALYSIS

### 7.1 Identify High Resource Consumers by Email
```sql
SELECT 
    agent_name,
    agent_type,
    time,
    process_count,
    high_cpu_process_count,
    high_mem_process_count,
    avg_process_cpu,
    avg_process_memory,
    total_threads,
    zombie_process_count
FROM rihno_metrics
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
  AND (high_cpu_process_count > 0 OR high_mem_process_count > 0)
ORDER BY time DESC;
```

### 7.2 Detect Suspicious Process Behavior
```sql
SELECT 
    agent_name,
    time,
    suspicious_process_names,
    process_count,
    process_creation_rate,
    process_termination_rate,
    zombie_process_count,
    root_process_count
FROM rihno_metrics
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '48 hours'
  AND (
    suspicious_process_names > 0
    OR zombie_process_count > 10
    OR (process_creation_rate > 100 AND process_termination_rate > 100)
  )
ORDER BY time DESC;
```

---

## SECTION 8: DISK & I/O ANALYSIS

### 8.1 Monitor Disk I/O for Device
```sql
SELECT 
    time,
    disk_read_bytes,
    disk_write_bytes,
    disk_read_rate,
    disk_write_rate,
    disk_io_rate,
    disk_read_count,
    disk_write_count
FROM rihno_metrics
WHERE agent_name = 'PROD-SERVER-01'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;
```

### 8.2 Detect High Disk Activity by Device Type
```sql
SELECT 
    agent_name,
    time,
    disk_io_rate,
    disk_read_rate,
    disk_write_rate
FROM rihno_metrics
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '7 days'
  AND disk_io_rate > 100000000  -- >100 MB/s
ORDER BY disk_io_rate DESC;
```

---

## SECTION 9: FAST QUERIES USING AGGREGATES

### 9.1 Real-Time Dashboard (Using 1-Minute Aggregates)
```sql
SELECT DISTINCT ON (agent_id)
    bucket as time,
    agent_name,
    agent_type,
    email,
    ROUND(avg_cpu::NUMERIC, 2) as cpu,
    ROUND(avg_memory::NUMERIC, 2) as memory,
    ROUND(avg_connections::NUMERIC, 1) as connections,
    max_port_scan_score as port_scan_risk,
    max_exfil_score as exfil_risk,
    max_c2_score as c2_risk
FROM rihno_metrics_1min
WHERE email = 'user@example.com'
  AND bucket > NOW() - INTERVAL '1 hour'
ORDER BY agent_id, bucket DESC;
```

### 9.2 Historical Trends (Using 1-Hour Aggregates)
```sql
SELECT 
    bucket,
    agent_name,
    ROUND(avg_cpu::NUMERIC, 2) as cpu,
    ROUND(avg_memory::NUMERIC, 2) as memory,
    ROUND(max_cpu::NUMERIC, 2) as peak_cpu,
    ROUND(max_memory::NUMERIC, 2) as peak_memory,
    sample_count
FROM rihno_metrics_1hr
WHERE agent_name = 'PROD-SERVER-01'
  AND bucket > NOW() - INTERVAL '7 days'
ORDER BY bucket DESC;
```

---

## SECTION 10: INVENTORY & MANAGEMENT

### 10.1 List All Agents for Email
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    first_seen,
    last_seen,
    is_active,
    ip_address,
    CASE 
        WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 'Online'
        WHEN last_seen > NOW() - INTERVAL '1 hour' THEN 'Recently Online'
        ELSE 'Offline'
    END as status
FROM rihno_agents
WHERE email = 'user@example.com'
ORDER BY last_seen DESC;
```

### 10.2 Find All Agents of Type
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    is_active,
    last_seen,
    NOW() - last_seen as time_since_last_seen
FROM rihno_agents
WHERE agent_type = 'server'
  AND is_active = TRUE
ORDER BY last_seen DESC;
```

### 10.3 Find Offline Agents (Not Seen in 24 Hours)
```sql
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    last_seen,
    NOW() - last_seen as time_offline
FROM rihno_agents
WHERE last_seen < NOW() - INTERVAL '24 hours'
  AND is_active = TRUE
ORDER BY last_seen ASC;
```

---

## SECTION 11: COMBINED QUERIES

### 11.1 Full Security Posture for Email
```sql
WITH latest_metrics AS (
    SELECT DISTINCT ON (agent_id)
        agent_id,
        agent_name,
        agent_type,
        time,
        system_cpu,
        system_memory_percent,
        total_connections,
        port_scanning_score,
        data_exfiltration_score,
        c2_communication_score,
        suspicious_port_connections,
        suspicious_process_names
    FROM rihno_metrics
    WHERE email = 'user@example.com'
    ORDER BY agent_id, time DESC
),
recent_alerts AS (
    SELECT 
        agent_id,
        COUNT(*) as alert_count,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_alerts,
        MAX(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as has_critical
    FROM rihno_alerts
    WHERE email = 'user@example.com'
      AND time > NOW() - INTERVAL '24 hours'
    GROUP BY agent_id
)
SELECT 
    m.agent_id,
    m.agent_name,
    m.agent_type,
    m.time as last_metrics_time,
    m.system_cpu,
    m.system_memory_percent,
    m.total_connections,
    CASE 
        WHEN m.port_scanning_score > 50 THEN 'HIGH'
        WHEN m.port_scanning_score > 20 THEN 'MEDIUM'
        ELSE 'LOW'
    END as port_scan_risk,
    CASE 
        WHEN m.data_exfiltration_score > 50 THEN 'HIGH'
        WHEN m.data_exfiltration_score > 20 THEN 'MEDIUM'
        ELSE 'LOW'
    END as exfil_risk,
    CASE 
        WHEN m.c2_communication_score > 70 THEN 'HIGH'
        WHEN m.c2_communication_score > 40 THEN 'MEDIUM'
        ELSE 'LOW'
    END as c2_risk,
    COALESCE(a.alert_count, 0) as alerts_24h,
    COALESCE(a.unresolved_alerts, 0) as unresolved_alerts,
    CASE WHEN a.has_critical = 1 THEN 'YES' ELSE 'NO' END as critical_alerts
FROM latest_metrics m
LEFT JOIN recent_alerts a ON m.agent_id = a.agent_id
ORDER BY a.unresolved_alerts DESC NULLS LAST, m.port_scanning_score DESC;
```

### 11.2 Security Incident Investigation
```sql
-- Find all context for a suspect device over 48 hours
SELECT 
    'Metrics' as data_type,
    m.time,
    m.agent_name,
    m.system_cpu::text,
    m.system_memory_percent::text,
    m.port_scanning_score::text,
    m.data_exfiltration_score::text,
    m.c2_communication_score::text
FROM rihno_metrics m
WHERE m.agent_name = 'SUSPECT-DEVICE'
  AND m.time > NOW() - INTERVAL '48 hours'

UNION ALL

SELECT 
    'Alert',
    a.time,
    a.agent_name,
    a.alert_type,
    a.severity,
    a.description,
    ''
FROM rihno_alerts a
WHERE a.agent_name = 'SUSPECT-DEVICE'
  AND a.time > NOW() - INTERVAL '48 hours'

UNION ALL

SELECT 
    'Connection',
    c.time,
    c.agent_name,
    CONCAT(c.remote_ip, ':', c.remote_port),
    c.protocol,
    c.state,
    CASE WHEN c.is_suspicious THEN 'SUSPICIOUS' ELSE '' END
FROM rihno_connections c
WHERE c.agent_name = 'SUSPECT-DEVICE'
  AND c.time > NOW() - INTERVAL '48 hours'
  AND c.is_suspicious = TRUE

ORDER BY time DESC;
```

---

## QUERY TIPS & PERFORMANCE

### 1. **Use Time Ranges**
Always include a time filter to leverage TimescaleDB's chunking:
```sql
WHERE time > NOW() - INTERVAL '24 hours'  -- Good!
```

### 2. **Filter by agent_id When Possible**
```sql
WHERE agent_id = 'some-agent-id'  -- Fastest
-- Instead of:
WHERE agent_name = 'name'  -- Slower scan
```

### 3. **Use 1-Minute/1-Hour Aggregates for Trending**
```sql
-- For dashboards, use:
SELECT * FROM rihno_metrics_1min   -- 100x faster than raw
-- Instead of querying:
SELECT * FROM rihno_metrics        -- Raw data
```

### 4. **Partial Indexes for Anomalies**
These queries automatically use partial indexes:
```sql
WHERE suspicious_process_names > 0  -- Uses idx_metrics_suspicious
WHERE port_scanning_score > 50       -- Uses idx_metrics_suspicious
WHERE system_cpu > 90                -- Uses idx_metrics_high_cpu
WHERE is_suspicious = TRUE           -- Uses idx_conn_suspicious
WHERE resolved = FALSE               -- Uses idx_alerts_unresolved
```

### 5. **Common Time Ranges**
```sql
NOW() - INTERVAL '10 seconds'    -- Last snapshot
NOW() - INTERVAL '1 minute'      -- Last minute
NOW() - INTERVAL '1 hour'        -- Last hour
NOW() - INTERVAL '24 hours'      -- Last day
NOW() - INTERVAL '7 days'        -- Last week
NOW() - INTERVAL '30 days'       -- Last month (limit: only 30d raw data)
NOW() - INTERVAL '1 year'        -- Last year (use 1hr aggregates)
```

---

## EXPORT EXAMPLES

### Export Metrics to CSV
```sql
COPY (
    SELECT 
        time,
        agent_name,
        agent_type,
        system_cpu,
        system_memory_percent,
        total_connections,
        port_scanning_score,
        data_exfiltration_score,
        c2_communication_score
    FROM rihno_metrics
    WHERE email = 'user@example.com'
      AND time > NOW() - INTERVAL '7 days'
    ORDER BY time DESC
) TO STDOUT WITH CSV HEADER;
```

### Export Alerts to JSON
```sql
SELECT json_agg(
    json_build_object(
        'time', time,
        'agent_name', agent_name,
        'alert_type', alert_type,
        'severity', severity,
        'description', description,
        'metric_value', metric_value,
        'threshold', threshold
    )
)
FROM rihno_alerts
WHERE email = 'user@example.com'
  AND time > NOW() - INTERVAL '24 hours'
  AND resolved = FALSE;
```