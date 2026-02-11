# Practical SQL Examples - Combined Filters

This document provides real-world query examples using combinations of **email**, **agent_name** (device name), and **agent_type** (device type).

---

## SCENARIO 1: SINGLE USER, ALL DEVICES

### 1.1 Get Health Status of All Devices for a User
```sql
SELECT 
    agent_name,
    agent_type,
    CASE 
        WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 'Online'
        WHEN last_seen > NOW() - INTERVAL '1 hour' THEN 'Recently Online'
        ELSE 'Offline'
    END as status,
    last_seen,
    (SELECT MAX(time) FROM rihno_metrics 
     WHERE agent_id = rihno_agents.agent_id) as last_metrics_time
FROM rihno_agents
WHERE email = 'john.doe@company.com'
ORDER BY last_seen DESC;
```

### 1.2 Get Latest Metrics for All User Devices
```sql
SELECT DISTINCT ON (a.agent_id)
    a.agent_name,
    a.agent_type,
    m.time,
    m.system_cpu,
    m.system_memory_percent,
    m.total_connections,
    m.port_scanning_score,
    m.data_exfiltration_score,
    m.c2_communication_score,
    m.suspicious_port_connections
FROM rihno_agents a
LEFT JOIN rihno_metrics m ON a.agent_id = m.agent_id
WHERE a.email = 'john.doe@company.com'
ORDER BY a.agent_id, m.time DESC;
```

### 1.3 Alert Summary for All User Devices (Last 24 Hours)
```sql
SELECT 
    agent_name,
    agent_type,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
    COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved
FROM rihno_alerts
WHERE email = 'john.doe@company.com'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, agent_type
ORDER BY total_alerts DESC;
```

---

## SCENARIO 2: SINGLE DEVICE, DETAILED ANALYSIS

### 2.1 Complete Device Profile
```sql
-- Get agent info
SELECT 
    agent_id,
    agent_name,
    agent_type,
    email,
    first_seen,
    last_seen,
    is_active,
    ip_address
FROM rihno_agents
WHERE agent_name = 'LAPTOP-JOHN'
  AND agent_type = 'workstation'
  AND email = 'john.doe@company.com';

-- Get latest metrics
SELECT DISTINCT ON (agent_id)
    agent_id,
    agent_name,
    time,
    system_cpu,
    system_memory_percent,
    process_count,
    total_connections,
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score
FROM rihno_metrics
WHERE agent_name = 'LAPTOP-JOHN'
ORDER BY agent_id, time DESC
LIMIT 1;

-- Get recent alerts
SELECT 
    time,
    alert_type,
    severity,
    description
FROM rihno_alerts
WHERE agent_name = 'LAPTOP-JOHN'
  AND time > NOW() - INTERVAL '7 days'
ORDER BY time DESC;
```

### 2.2 Hourly Trend for Specific Device (Last 7 Days)
```sql
SELECT 
    time_bucket('1 hour', time) as hour,
    COUNT(*) as samples,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_mem,
    ROUND(MAX(system_memory_percent)::NUMERIC, 2) as max_mem,
    ROUND(AVG(total_connections)::NUMERIC, 1) as avg_conns,
    ROUND(MAX(port_scanning_score)::NUMERIC, 2) as max_port_scan
FROM rihno_metrics
WHERE agent_name = 'SERVER-PROD-01'
  AND agent_type = 'server'
  AND email = 'sysadmin@company.com'
  AND time > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

### 2.3 Process and Network Activity for Device
```sql
-- Process stats
SELECT 
    time,
    process_count,
    high_cpu_process_count,
    high_mem_process_count,
    suspicious_process_names,
    zombie_process_count
FROM rihno_metrics
WHERE agent_name = 'WORKSTATION-02'
  AND email = 'analyst@company.com'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;

-- Network connections
SELECT 
    time,
    total_connections,
    tcp_connections,
    udp_connections,
    established_connections,
    listen_connections,
    unique_source_ips,
    unique_dest_ips,
    external_ip_count
FROM rihno_metrics
WHERE agent_name = 'WORKSTATION-02'
  AND email = 'analyst@company.com'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC;
```

### 2.4 Suspicious Connections for Device
```sql
SELECT 
    time,
    remote_ip,
    remote_port,
    local_port,
    protocol,
    process_name,
    direction,
    is_suspicious
FROM rihno_connections
WHERE agent_name = 'SUSPECT-DEVICE'
  AND email = 'security@company.com'
  AND time > NOW() - INTERVAL '48 hours'
  AND (is_suspicious = TRUE OR remote_port IN (4444, 5555, 6666, 1337))
ORDER BY time DESC
LIMIT 100;
```

---

## SCENARIO 3: DEVICE TYPE ANALYSIS

### 3.1 All Servers Overview (Last Hour)
```sql
SELECT DISTINCT ON (m.agent_id)
    a.agent_name,
    a.agent_type,
    a.email,
    m.time,
    m.system_cpu,
    m.system_memory_percent,
    m.total_connections,
    m.port_scanning_score,
    m.data_exfiltration_score,
    m.c2_communication_score,
    CASE 
        WHEN m.system_cpu > 90 OR m.system_memory_percent > 90 THEN 'WARNING'
        WHEN m.port_scanning_score > 50 THEN 'ALERT'
        WHEN m.data_exfiltration_score > 50 THEN 'CRITICAL'
        WHEN m.c2_communication_score > 70 THEN 'CRITICAL'
        ELSE 'OK'
    END as status
FROM rihno_agents a
LEFT JOIN rihno_metrics m ON a.agent_id = m.agent_id
WHERE a.agent_type = 'server'
ORDER BY a.agent_id, m.time DESC;
```

### 3.2 Compare All Workstations in Last 24 Hours
```sql
SELECT 
    a.agent_name,
    a.email,
    ROUND(AVG(m.system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(m.system_cpu)::NUMERIC, 2) as max_cpu,
    ROUND(AVG(m.system_memory_percent)::NUMERIC, 2) as avg_mem,
    ROUND(AVG(m.total_connections)::NUMERIC, 1) as avg_conns,
    COUNT(CASE WHEN m.port_scanning_score > 50 THEN 1 END) as port_scan_incidents,
    COUNT(CASE WHEN m.suspicious_port_connections > 0 THEN 1 END) as suspicious_events,
    COUNT(*) as total_samples
FROM rihno_agents a
LEFT JOIN rihno_metrics m ON a.agent_id = m.agent_id
WHERE a.agent_type = 'workstation'
  AND m.time > NOW() - INTERVAL '24 hours'
GROUP BY a.agent_name, a.email
ORDER BY max_cpu DESC;
```

### 3.3 Find Troubled Devices of Type
```sql
WITH recent_metrics AS (
    SELECT 
        agent_id,
        agent_name,
        email,
        AVG(system_cpu) as avg_cpu,
        MAX(system_cpu) as max_cpu,
        COUNT(CASE WHEN port_scanning_score > 50 THEN 1 END) as port_scan_count,
        COUNT(CASE WHEN data_exfiltration_score > 50 THEN 1 END) as exfil_count,
        COUNT(CASE WHEN suspicious_port_connections > 0 THEN 1 END) as susp_conn_count
    FROM rihno_metrics
    WHERE agent_type = 'server'
      AND time > NOW() - INTERVAL '24 hours'
    GROUP BY agent_id, agent_name, email
)
SELECT 
    agent_name,
    email,
    ROUND(avg_cpu::NUMERIC, 2) as avg_cpu,
    ROUND(max_cpu::NUMERIC, 2) as max_cpu,
    port_scan_count,
    exfil_count,
    susp_conn_count
FROM recent_metrics
WHERE avg_cpu > 50 
   OR max_cpu > 95
   OR port_scan_count > 0
   OR exfil_count > 0
   OR susp_conn_count > 0
ORDER BY max_cpu DESC;
```

### 3.4 Security Risk Dashboard for Device Type
```sql
SELECT 
    a.agent_name,
    a.email,
    CASE 
        WHEN m.port_scanning_score > 50 THEN 'Port Scanning'
        WHEN m.data_exfiltration_score > 50 THEN 'Data Exfiltration'
        WHEN m.c2_communication_score > 70 THEN 'C2 Communication'
        WHEN m.suspicious_port_connections > 0 THEN 'Suspicious Ports'
        WHEN m.suspicious_process_names > 0 THEN 'Suspicious Processes'
        WHEN m.bandwidth_asymmetry > 0.8 THEN 'Abnormal Traffic Pattern'
        ELSE 'No Threat Detected'
    END as threat_type,
    COUNT(*) as occurrences,
    MAX(m.time) as most_recent
FROM rihno_agents a
LEFT JOIN rihno_metrics m ON a.agent_id = m.agent_id
WHERE a.agent_type = 'workstation'
  AND m.time > NOW() - INTERVAL '24 hours'
  AND (
    m.port_scanning_score > 50
    OR m.data_exfiltration_score > 50
    OR m.c2_communication_score > 70
    OR m.suspicious_port_connections > 0
    OR m.suspicious_process_names > 0
    OR m.bandwidth_asymmetry > 0.8
  )
GROUP BY a.agent_name, a.email, threat_type
ORDER BY occurrences DESC;
```

---

## SCENARIO 4: MULTI-USER, MULTI-DEVICE QUERIES

### 4.1 Organization-Wide Security Summary
```sql
SELECT 
    email,
    COUNT(DISTINCT agent_id) as device_count,
    COUNT(DISTINCT agent_type) as device_types,
    SUM(CASE WHEN agent_type = 'server' THEN 1 ELSE 0 END) as servers,
    SUM(CASE WHEN agent_type = 'workstation' THEN 1 ELSE 0 END) as workstations,
    COUNT(CASE WHEN is_active = TRUE AND last_seen > NOW() - INTERVAL '1 hour' THEN 1 END) as online_now,
    COUNT(CASE WHEN last_seen < NOW() - INTERVAL '24 hours' THEN 1 END) as offline_24h
FROM rihno_agents
GROUP BY email
ORDER BY device_count DESC;
```

### 4.2 Find All Devices with Specific Threat Pattern
```sql
-- Find all devices (any email, any type) showing data exfiltration
SELECT DISTINCT
    m.email,
    m.agent_name,
    m.agent_type,
    m.time,
    m.data_exfiltration_score,
    m.bandwidth_asymmetry,
    m.net_send_rate,
    m.net_recv_rate,
    m.total_outgoing_connections,
    m.unique_outgoing_ips
FROM rihno_metrics m
WHERE m.time > NOW() - INTERVAL '24 hours'
  AND m.data_exfiltration_score > 50
ORDER BY m.data_exfiltration_score DESC;
```

### 4.3 Compare Same Device Type Across Users
```sql
-- Compare all servers across all users
SELECT 
    email,
    agent_name,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(system_cpu)::NUMERIC, 2) as peak_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_mem,
    ROUND(MAX(system_memory_percent)::NUMERIC, 2) as peak_mem,
    COUNT(CASE WHEN port_scanning_score > 50 THEN 1 END) as threats_detected
FROM rihno_metrics
WHERE agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
GROUP BY email, agent_name
ORDER BY peak_cpu DESC;
```

### 4.4 Organization Alert Summary
```sql
SELECT 
    email,
    agent_type,
    COUNT(*) as total_alerts,
    COUNT(DISTINCT agent_id) as affected_devices,
    COUNT(DISTINCT alert_type) as alert_types,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
    COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_count
FROM rihno_alerts
WHERE time > NOW() - INTERVAL '7 days'
GROUP BY email, agent_type
ORDER BY critical_count DESC, total_alerts DESC;
```

---

## SCENARIO 5: TIME-BASED COMPARISONS

### 5.1 Compare Device Performance: Yesterday vs Today
```sql
WITH today AS (
    SELECT 
        agent_name,
        email,
        ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
        ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu
    FROM rihno_metrics
    WHERE agent_name = 'SERVER-PROD-01'
      AND email = 'ops@company.com'
      AND time > NOW() - INTERVAL '1 day'
      AND time <= NOW()
    GROUP BY agent_name, email
),
yesterday AS (
    SELECT 
        agent_name,
        email,
        ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
        ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu
    FROM rihno_metrics
    WHERE agent_name = 'SERVER-PROD-01'
      AND email = 'ops@company.com'
      AND time > NOW() - INTERVAL '2 days'
      AND time <= NOW() - INTERVAL '1 day'
    GROUP BY agent_name, email
)
SELECT 
    t.agent_name,
    t.email,
    y.avg_cpu as yesterday_avg_cpu,
    t.avg_cpu as today_avg_cpu,
    ROUND((t.avg_cpu - y.avg_cpu)::NUMERIC, 2) as cpu_change,
    y.max_cpu as yesterday_max_cpu,
    t.max_cpu as today_max_cpu
FROM today t
LEFT JOIN yesterday y USING (agent_name, email);
```

### 5.2 Identify Anomalies (Device Performance Spike)
```sql
WITH hourly_stats AS (
    SELECT 
        agent_name,
        agent_type,
        email,
        time_bucket('1 hour', time) as hour,
        ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
        ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_mem,
        ROUND(AVG(total_connections)::NUMERIC, 1) as avg_conns
    FROM rihno_metrics
    WHERE agent_type = 'server'
      AND time > NOW() - INTERVAL '7 days'
    GROUP BY agent_name, agent_type, email, hour
),
hourly_avg AS (
    SELECT 
        agent_name,
        email,
        ROUND(AVG(avg_cpu)::NUMERIC, 2) as baseline_cpu,
        ROUND(AVG(avg_mem)::NUMERIC, 2) as baseline_mem
    FROM hourly_stats
    GROUP BY agent_name, email
)
SELECT 
    h.agent_name,
    h.email,
    h.hour,
    h.avg_cpu,
    ha.baseline_cpu,
    ROUND(((h.avg_cpu - ha.baseline_cpu) / ha.baseline_cpu * 100)::NUMERIC, 1) as cpu_variance_pct,
    h.avg_mem,
    ha.baseline_mem,
    ROUND(((h.avg_mem - ha.baseline_mem) / ha.baseline_mem * 100)::NUMERIC, 1) as mem_variance_pct
FROM hourly_stats h
JOIN hourly_avg ha USING (agent_name, email)
WHERE h.avg_cpu > ha.baseline_cpu * 1.5  -- >50% above baseline
   OR h.avg_mem > ha.baseline_mem * 1.5
ORDER BY h.hour DESC, cpu_variance_pct DESC;
```

---

## SCENARIO 6: INCIDENT INVESTIGATION

### 6.1 Timeline of Events for Suspicious Device
```sql
SELECT 
    'Metrics' as event_type,
    time,
    agent_name,
    agent_type,
    NULL::TEXT as alert_type,
    port_scanning_score::TEXT,
    data_exfiltration_score::TEXT,
    c2_communication_score::TEXT
FROM rihno_metrics
WHERE agent_name = 'COMPROMISED-DEVICE'
  AND email = 'security@company.com'
  AND time > NOW() - INTERVAL '72 hours'

UNION ALL

SELECT 
    'Alert',
    time,
    agent_name,
    agent_type,
    alert_type,
    severity::TEXT,
    description::TEXT,
    metric_value::TEXT
FROM rihno_alerts
WHERE agent_name = 'COMPROMISED-DEVICE'
  AND email = 'security@company.com'
  AND time > NOW() - INTERVAL '72 hours'

UNION ALL

SELECT 
    'Suspicious Connection',
    time,
    agent_name,
    NULL::TEXT,
    CONCAT(remote_ip, ':', remote_port),
    protocol::TEXT,
    state::TEXT,
    process_name::TEXT
FROM rihno_connections
WHERE agent_name = 'COMPROMISED-DEVICE'
  AND time > NOW() - INTERVAL '72 hours'
  AND is_suspicious = TRUE

ORDER BY time ASC;
```

### 6.2 Find Similar Incidents Across Fleet
```sql
-- Find other devices showing same threat pattern as suspicious device
SELECT 
    m.agent_name,
    m.agent_type,
    m.email,
    m.time,
    m.port_scanning_score,
    m.data_exfiltration_score,
    m.c2_communication_score
FROM rihno_metrics m
WHERE m.agent_type = 'workstation'
  AND m.time > NOW() - INTERVAL '7 days'
  AND (
    (m.port_scanning_score > 50 AND 
     (SELECT port_scanning_score FROM rihno_metrics 
      WHERE agent_name = 'COMPROMISED-DEVICE' 
      ORDER BY time DESC LIMIT 1) > 50)
    OR
    (m.data_exfiltration_score > 50 AND
     (SELECT data_exfiltration_score FROM rihno_metrics 
      WHERE agent_name = 'COMPROMISED-DEVICE' 
      ORDER BY time DESC LIMIT 1) > 50)
  )
  AND m.agent_name != 'COMPROMISED-DEVICE'
ORDER BY m.email, m.time DESC;
```

---

## SCENARIO 7: REPORTING QUERIES

### 7.1 Daily Security Report for User
```sql
SELECT 
    CURRENT_DATE as report_date,
    'john.doe@company.com' as user_email,
    COUNT(DISTINCT a.agent_id) as device_count,
    COUNT(DISTINCT a.agent_type) as device_types_count,
    (SELECT COUNT(*) FROM rihno_agents 
     WHERE email = 'john.doe@company.com' AND is_active = TRUE 
     AND last_seen > NOW() - INTERVAL '1 hour') as online_devices,
    (SELECT COUNT(*) FROM rihno_alerts 
     WHERE email = 'john.doe@company.com' AND time > NOW() - INTERVAL '24 hours') as alerts_24h,
    (SELECT COUNT(*) FROM rihno_alerts 
     WHERE email = 'john.doe@company.com' AND time > NOW() - INTERVAL '24 hours'
     AND resolved = FALSE) as unresolved_alerts,
    (SELECT COUNT(*) FROM rihno_alerts 
     WHERE email = 'john.doe@company.com' AND time > NOW() - INTERVAL '24 hours'
     AND severity = 'critical') as critical_alerts,
    (SELECT COUNT(*) FROM rihno_metrics m
     JOIN rihno_agents a ON m.agent_id = a.agent_id
     WHERE a.email = 'john.doe@company.com'
     AND m.time > NOW() - INTERVAL '24 hours'
     AND (m.port_scanning_score > 50 OR m.data_exfiltration_score > 50)) as threat_detections
FROM rihno_agents a
WHERE a.email = 'john.doe@company.com';
```

### 7.2 Monthly Trend Report by Device Type
```sql
SELECT 
    agent_type,
    DATE_TRUNC('month', time)::DATE as month,
    COUNT(DISTINCT agent_id) as device_count,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(AVG(system_memory_percent)::NUMERIC, 2) as avg_memory,
    ROUND(AVG(total_connections)::NUMERIC, 1) as avg_connections,
    COUNT(CASE WHEN port_scanning_score > 50 THEN 1 END) as port_scan_incidents,
    COUNT(CASE WHEN suspicious_port_connections > 0 THEN 1 END) as susp_port_incidents,
    COUNT(CASE WHEN suspicious_process_names > 0 THEN 1 END) as malware_indicators
FROM rihno_metrics
WHERE time > NOW() - INTERVAL '90 days'
GROUP BY agent_type, DATE_TRUNC('month', time)
ORDER BY agent_type, month DESC;
```

### 7.3 Compliance Report: Device Coverage
```sql
SELECT 
    email,
    agent_type,
    COUNT(DISTINCT agent_id) as device_count,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count,
    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_count,
    ROUND(100.0 * COUNT(CASE WHEN is_active = TRUE THEN 1 END) / 
          COUNT(DISTINCT agent_id), 2) as active_percentage,
    ROUND(100.0 * COUNT(CASE WHEN last_seen > NOW() - INTERVAL '24 hours' THEN 1 END) / 
          COUNT(DISTINCT agent_id), 2) as reporting_24h_percentage
FROM rihno_agents
GROUP BY email, agent_type
ORDER BY email, agent_type;
```

---

## QUERY OPTIMIZATION TIPS

### 1. **Exact Filter Combinations (Fastest)**
```sql
-- Best performance
WHERE email = 'user@example.com'
  AND agent_name = 'DEVICE-01'
  AND agent_type = 'server'
  AND time > NOW() - INTERVAL '24 hours'
```

### 2. **With CTE for Reusable Logic**
```sql
-- Use CTEs when filtering multiple tables
WITH user_agents AS (
    SELECT agent_id FROM rihno_agents 
    WHERE email = 'user@example.com' 
    AND agent_type = 'server'
)
SELECT * FROM rihno_metrics m
WHERE m.agent_id IN (SELECT agent_id FROM user_agents)
  AND m.time > NOW() - INTERVAL '24 hours';
```

### 3. **Use DISTINCT ON for Latest Per Group**
```sql
-- Get one row per device (the latest)
SELECT DISTINCT ON (agent_id)
    agent_id, agent_name, time, system_cpu
FROM rihno_metrics
WHERE email = 'user@example.com'
ORDER BY agent_id, time DESC;
```

### 4. **Aggregate for Summary Stats**
```sql
-- Faster than multiple individual queries
SELECT 
    agent_name,
    COUNT(*) as total_samples,
    ROUND(AVG(system_cpu)::NUMERIC, 2) as avg_cpu,
    ROUND(MAX(system_cpu)::NUMERIC, 2) as max_cpu
FROM rihno_metrics
WHERE agent_type = 'server' AND time > NOW() - INTERVAL '24 hours'
GROUP BY agent_name;
```