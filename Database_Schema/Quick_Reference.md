# RIHNO Documentation Index & Quick Reference

---

## 📚 DOCUMENTATION OVERVIEW

This package contains comprehensive documentation about the RIHNO security monitoring system database. Here's how to navigate it:

### **Files Included:**

1. **BUG_FIX_SUMMARY.md** - ⚠️ Start here if you had a database error
    - Explains the SQL parameter count mismatch
    - Shows the exact fix applied
    - Details the missing metrics

2. **SCHEMA_EXPLANATION.md** - 📖 Complete database schema reference
    - Detailed explanation of all 7 tables
    - Column descriptions for 99+ metrics
    - Index strategy and retention policies
    - Use cases for each table

3. **SQL_QUERIES_GUIDE.md** - 🔍 Comprehensive SQL query examples
    - 11 sections with 40+ ready-to-use queries
    - Organized by query type (basic, time-range, aggregation, security, alerts, etc.)
    - Performance tips and export examples

4. **PRACTICAL_SQL_EXAMPLES.md** - 💡 Real-world scenario queries
    - 7 practical scenarios with multi-filter examples
    - Incident investigation queries
    - Reporting and compliance queries
    - Optimization tips for combined filters

5. **QUICK_REFERENCE.md** - ⚡ Quick lookup guide (THIS FILE)
    - Fast reference for common queries
    - Filter combinations
    - Key metrics explanation

---

## 🎯 QUICK START

### **Find the Right Query:**

| **I want to...** | **Go to...** | **Query Example** |
|------------------|------------|-------------------|
| Get latest metrics for a user | SQL_QUERIES_GUIDE.md § 1.1 | `WHERE email = 'user@example.com'` |
| Get metrics for a device | SQL_QUERIES_GUIDE.md § 1.2 | `WHERE agent_name = 'DEVICE-01'` |
| Get all servers in fleet | SQL_QUERIES_GUIDE.md § 1.3 | `WHERE agent_type = 'server'` |
| See time-range metrics | SQL_QUERIES_GUIDE.md § 2 | Last 24h/7d/30d |
| Get statistics/averages | SQL_QUERIES_GUIDE.md § 3 | `GROUP BY agent_name` |
| Find security threats | SQL_QUERIES_GUIDE.md § 4 | Port scanning, exfiltration, C2 |
| View alerts | SQL_QUERIES_GUIDE.md § 5 | Severity filtering, unresolved only |
| Analyze network | SQL_QUERIES_GUIDE.md § 6 | Connections, traffic direction |
| Investigate incidents | PRACTICAL_SQL_EXAMPLES.md § 6 | Timeline, similar incidents |
| Create reports | PRACTICAL_SQL_EXAMPLES.md § 7 | Daily, monthly, compliance |

---

## 🔑 KEY FILTERS

All queries use these three main filters. Combine as needed:

### **1. Email (Account/Owner)**
```sql
WHERE email = 'john.doe@company.com'
```
- Filters by account owner
- One user can have multiple devices
- Use this to show one user their devices

### **2. Agent Name (Device Name)**
```sql
WHERE agent_name = 'DESKTOP-01'
```
- Human-readable device identifier
- Must match exactly (case-sensitive)
- Used for single-device investigations

### **3. Agent Type (Device Type)**
```sql
WHERE agent_type = 'server'
```
- Categories: `server`, `workstation`, `cloud`, etc.
- Can have multiple devices of same type
- Use to compare across device category

### **Common Combinations:**

```sql
-- All devices for one user
WHERE email = 'user@example.com'

-- One specific device
WHERE agent_name = 'DEVICE-01' AND agent_type = 'server'

-- All servers for one user
WHERE email = 'user@example.com' AND agent_type = 'server'

-- One device for one user (most specific)
WHERE email = 'user@example.com' 
  AND agent_name = 'DEVICE-01'

-- All servers across organization
WHERE agent_type = 'server'

-- All servers showing threats
WHERE agent_type = 'server' 
  AND port_scanning_score > 50
```

---

## 📊 TABLES AT A GLANCE

| Table | Purpose | Rows Per Day | Retention | Speed |
|-------|---------|--------------|-----------|-------|
| **rihno_metrics** | Raw metrics snapshots | 8,640/agent | 30 days | Slower* |
| **rihno_metrics_1min** | 1-min aggregates | 1,440/agent | 7 days | 🚀 Fast |
| **rihno_metrics_1hr** | 1-hr aggregates | 24/agent | 365 days | 🚀 Fast |
| **rihno_connections** | Individual connections | ~10k/agent | 7 days | Medium |
| **rihno_network_maps** | Full topology JSON | 8,640/agent | 7 days | Medium |
| **rihno_alerts** | Security alerts | Variable | 90 days | Medium |
| **rihno_agents** | Device registry | 1/device | Forever | 🚀 Fast |

*Use time filters to speed up raw metrics queries: `time > NOW() - INTERVAL '24 hours'`

---

## 🔍 COMMON METRICS EXPLAINED

### **System Resources**
- `system_cpu` - Overall CPU usage % (0-100)
- `system_memory_percent` - RAM usage % (0-100)
- `total_connections` - Active TCP/UDP connections

### **Security Scores** (ML-generated, 0-100)
- `port_scanning_score` - Probability of port scanning activity
- `data_exfiltration_score` - Probability of data theft
- `c2_communication_score` - Probability of C2 beaconing
- `bandwidth_asymmetry` - Imbalance in send/receive (0.5=balanced, 1.0=extreme)

### **Threat Indicators**
- `suspicious_port_connections` - Connections on known-malware ports
- `suspicious_process_names` - Processes matching malware signatures
- `port_scan_indicators` - Count of signs of port scanning
- `connection_churn_rate` - Rate of connection creation/termination

### **Network Activity**
- `unique_dest_ips` - How many different IPs contacted
- `unique_outgoing_ips` - Unique external IPs contacted
- `net_send_rate` - Upload speed in bytes/sec
- `net_recv_rate` - Download speed in bytes/sec

---

## ⚡ FASTEST QUERIES

For dashboards and real-time monitoring, use these patterns:

### **Option 1: Use 1-Minute Aggregates (100x faster)**
```sql
-- Get latest data for dashboard
SELECT * FROM rihno_metrics_1min
WHERE email = 'user@example.com'
  AND bucket > NOW() - INTERVAL '1 hour'
ORDER BY bucket DESC;
```

### **Option 2: Filter by Agent ID (If known)**
```sql
-- Faster than searching by agent_name
SELECT * FROM rihno_metrics
WHERE agent_id = 'abc123'  -- Instead of agent_name
  AND time > NOW() - INTERVAL '1 hour';
```

### **Option 3: Use Partial Indexes**
```sql
-- These automatically use fast partial indexes:
WHERE system_cpu > 90                   -- idx_metrics_high_cpu
WHERE suspicious_process_names > 0      -- idx_metrics_suspicious  
WHERE port_scanning_score > 50          -- idx_metrics_suspicious
WHERE is_suspicious = TRUE              -- idx_conn_suspicious
WHERE resolved = FALSE                  -- idx_alerts_unresolved
```

---

## 🚨 SECURITY INVESTIGATION WORKFLOW

### **Step 1: Find the Device**
```sql
-- Scenario: We know the email but not the device name
SELECT agent_name, agent_type, last_seen 
FROM rihno_agents 
WHERE email = 'user@example.com';
```

### **Step 2: Get Latest Metrics**
```sql
SELECT DISTINCT ON (agent_id)
    time, system_cpu, system_memory_percent,
    port_scanning_score, data_exfiltration_score,
    suspicious_port_connections
FROM rihno_metrics
WHERE agent_name = 'SUSPECT-DEVICE'
ORDER BY agent_id, time DESC;
```

### **Step 3: Check for Alerts**
```sql
SELECT time, alert_type, severity, description
FROM rihno_alerts
WHERE agent_name = 'SUSPECT-DEVICE'
  AND time > NOW() - INTERVAL '72 hours'
ORDER BY severity DESC, time DESC;
```

### **Step 4: Find Suspicious Connections**
```sql
SELECT time, remote_ip, remote_port, process_name, is_suspicious
FROM rihno_connections
WHERE agent_name = 'SUSPECT-DEVICE'
  AND time > NOW() - INTERVAL '72 hours'
  AND is_suspicious = TRUE;
```

### **Step 5: Extract Network Map (Forensic)**
```sql
SELECT network_map_json
FROM rihno_network_maps
WHERE agent_name = 'SUSPECT-DEVICE'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC
LIMIT 5;  -- Last 5 snapshots
```

### **Step 6: Create Timeline**
```sql
-- See PRACTICAL_SQL_EXAMPLES.md § 6.1 for full timeline query
-- Shows metrics, alerts, and connections on one timeline
```

---

## 📈 ALERT TYPES & SEVERITY

### **Alert Types Generated**
| Type | Trigger | Severity |
|------|---------|----------|
| HIGH_CPU | system_cpu > 95% | High |
| HIGH_MEMORY | system_memory > 95% | High |
| SUSPICIOUS_PORTS | Port count > 0 | Critical |
| SUSPICIOUS_PROCESSES | Process count > 0 | Critical |
| PORT_SCAN | score > 50 | High |
| DATA_EXFILTRATION | score > 50 | Critical |
| C2_COMMUNICATION | score > 70 | Critical |
| HIGH_CONN_CHURN | rate > 0.8 | Medium |
| SYN_FLOOD | syn_sent > 100 | High |
| HIGH_FAILED_CONNECTIONS | ratio > 0.5 | Medium |

### **Severity Levels**
- `critical` - Immediate action needed
- `high` - Investigate within hours
- `medium` - Monitor and review
- `low` - Informational

---

## 🔄 DATA FLOW & UPDATES

```
Agent (every 10 seconds)
         ↓
   Metrics Collection
         ↓
   Send to Dealer
         ↓
   rihno_metrics (raw) ──→ rihno_metrics_1min ──→ rihno_metrics_1hr
         ↓                      ↓                      ↓
    30-day raw            7-day rollup          365-day rollup
     (compressed)         (pre-computed)        (pre-computed)
```

---

## 📅 TIME INTERVAL CHEAT SHEET

For use in queries like: `time > NOW() - INTERVAL 'X'`

```sql
NOW() - INTERVAL '10 seconds'       -- Last sample
NOW() - INTERVAL '1 minute'         -- Last minute
NOW() - INTERVAL '5 minutes'        -- Last 5 min
NOW() - INTERVAL '1 hour'           -- Last hour
NOW() - INTERVAL '24 hours'         -- Last day
NOW() - INTERVAL '7 days'           -- Last week
NOW() - INTERVAL '30 days'          -- Last month
NOW() - INTERVAL '90 days'          -- Last quarter
NOW() - INTERVAL '1 year'           -- Last year (⚠️ use 1hr agg)
```

---

## 🛠️ QUERY BUILDING TEMPLATE

### **Template for Custom Queries**

```sql
SELECT 
    -- Identity
    agent_name,
    agent_type,
    email,
    time,
    
    -- System Resources
    system_cpu,
    system_memory_percent,
    
    -- Network
    total_connections,
    net_send_rate,
    net_recv_rate,
    
    -- Security
    port_scanning_score,
    data_exfiltration_score,
    c2_communication_score,
    suspicious_port_connections,
    suspicious_process_names
    
FROM rihno_metrics

WHERE 
    -- Required: time filter (for performance)
    time > NOW() - INTERVAL '24 hours'
    
    -- Optional: filter by email
    AND email = 'user@example.com'
    
    -- Optional: filter by device name
    AND agent_name = 'DEVICE-01'
    
    -- Optional: filter by device type
    AND agent_type = 'server'
    
    -- Optional: filter by threat
    AND (port_scanning_score > 50 OR data_exfiltration_score > 50)

ORDER BY time DESC;
```

---

## ❓ FAQ & TROUBLESHOOTING

### **Q: Why is my query slow?**
**A:**
- Add `time > NOW() - INTERVAL '...'` filter
- Use `rihno_metrics_1min` or `rihno_metrics_1hr` for trends
- Use `agent_id` instead of `agent_name` if known
- Limit to specific time ranges (raw data only kept 30 days)

### **Q: How do I find a device?**
**A:**
```sql
SELECT agent_id, agent_name, agent_type, email, last_seen
FROM rihno_agents
WHERE email = 'user@example.com';
```

### **Q: How do I export data?**
**A:** See SQL_QUERIES_GUIDE.md § 11 (Export Examples)

### **Q: Why are there gaps in my data?**
**A:**
- Raw metrics only kept 30 days (use aggregates for history)
- Network maps only kept 7 days
- Check if agent was offline: `SELECT last_seen FROM rihno_agents`

### **Q: What does "connection_churn_rate" mean?**
**A:** Rate of connection creation and termination. 0=stable, 1=very chaotic. High values = suspicious behavior.

### **Q: How do I detect data exfiltration?**
**A:** Look for:
- `data_exfiltration_score > 50`
- `bandwidth_asymmetry > 0.8` + high `net_send_rate`
- Many `unique_outgoing_ips` + high `net_send_rate`

### **Q: Which table for network forensics?**
**A:**
- `rihno_connections` - For queries about specific IPs/ports (7 days)
- `rihno_network_maps` - For full snapshot (JSON blob, 7 days)

---

## 📞 NEXT STEPS

1. **Read SCHEMA_EXPLANATION.md** - Understand what data you have
2. **Check SQL_QUERIES_GUIDE.md** - Pick a query type that matches your need
3. **Adapt from PRACTICAL_SQL_EXAMPLES.md** - See real-world examples
4. **Run queries** - Test and modify for your use case
5. **Bookmark this index** - Come back for quick reference

---

## 📝 NOTES

- All timestamps are in UTC (TIMESTAMPTZ)
- Email and agent_name are case-sensitive in WHERE clauses
- Security scores (0-100) are ML-generated, not 100% reliable alone
- Always use time filters for better performance
- Raw metrics auto-compress after 2 days, still fully queryable
- Aggregates (1min, 1hr) are 100x faster for trends

---

**Last Updated:** February 2026  
**Database:** RIHNO with TimescaleDB  
**Metrics Count:** 99 per snapshot per agent  
**Raw Retention:** 30 days | **Aggregate Retention:** Up to 1 year