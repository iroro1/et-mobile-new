# Database Preparation Module - Explained Like You're 5! 🗄️

## What are Databases? 🤔

Think of databases like giant filing cabinets! Just like you organize your papers in folders, databases organize information in tables. For Caterpillar's SIS 2.0 system, we use three special types of filing cabinets:

- **MySQL** = The main filing cabinet for all equipment and service records
- **Redis** = A super-fast filing cabinet for temporary information
- **Snowflake** = A huge warehouse filing cabinet for analyzing lots of data

## Why These Databases for Caterpillar SIS 2.0? 🏗️

- **MySQL**: Stores all the important equipment information, service records, and user data
- **Redis**: Makes the system super fast by remembering frequently used information
- **Snowflake**: Helps analyze patterns and trends in equipment maintenance

---

## 🗃️ MySQL (The Main Filing Cabinet)

### 1. Basic Database Structure

Creating tables for equipment and service records:

```sql
-- Create database
CREATE DATABASE sis_2_0;
USE sis_2_0;

-- Equipment table
CREATE TABLE equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    serial_number VARCHAR(100) UNIQUE,
    location VARCHAR(100),
    status ENUM('Operational', 'Maintenance', 'Offline', 'Retired') DEFAULT 'Operational',
    purchase_date DATE,
    last_service_date DATE,
    next_service_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_location (location),
    INDEX idx_next_service (next_service_date)
);

-- Service records table
CREATE TABLE service_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    service_date DATE NOT NULL,
    technician_id INT NOT NULL,
    service_type ENUM('Routine', 'Repair', 'Inspection', 'Emergency') NOT NULL,
    description TEXT,
    parts_used JSON,
    labor_hours DECIMAL(4,2),
    cost DECIMAL(10,2),
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id),
    INDEX idx_equipment_service (equipment_id, service_date),
    INDEX idx_technician (technician_id),
    INDEX idx_service_date (service_date)
);

-- Technicians table
CREATE TABLE technicians (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    certification_level ENUM('Basic', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Basic',
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Complex Queries (Smart Filing System)

Writing queries to find specific information:

```sql
-- Find all equipment that needs service in the next 30 days
SELECT
    e.id,
    e.name,
    e.type,
    e.location,
    e.next_service_date,
    DATEDIFF(e.next_service_date, CURDATE()) as days_until_service
FROM equipment e
WHERE e.next_service_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    AND e.status = 'Operational'
ORDER BY e.next_service_date ASC;

-- Get equipment maintenance history with technician details
SELECT
    sr.id,
    e.name as equipment_name,
    e.type,
    sr.service_date,
    sr.service_type,
    sr.description,
    sr.cost,
    t.name as technician_name,
    t.specialization
FROM service_records sr
JOIN equipment e ON sr.equipment_id = e.id
JOIN technicians t ON sr.technician_id = t.id
WHERE e.id = 123  -- Specific equipment
ORDER BY sr.service_date DESC
LIMIT 10;

-- Monthly service summary by equipment type
SELECT
    e.type,
    COUNT(sr.id) as total_services,
    AVG(sr.cost) as avg_cost,
    SUM(sr.labor_hours) as total_labor_hours,
    AVG(sr.labor_hours) as avg_labor_hours
FROM equipment e
JOIN service_records sr ON e.id = sr.equipment_id
WHERE sr.service_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    AND sr.status = 'Completed'
GROUP BY e.type
ORDER BY total_services DESC;

-- Find equipment with most frequent maintenance issues
SELECT
    e.id,
    e.name,
    e.type,
    COUNT(sr.id) as service_count,
    AVG(sr.cost) as avg_service_cost,
    MAX(sr.service_date) as last_service
FROM equipment e
JOIN service_records sr ON e.id = sr.equipment_id
WHERE sr.service_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    AND sr.status = 'Completed'
GROUP BY e.id, e.name, e.type
HAVING service_count > 3
ORDER BY service_count DESC;
```

### 3. Database Optimization (Making Filing Faster)

Indexes and query optimization:

```sql
-- Add composite indexes for better performance
CREATE INDEX idx_equipment_status_location ON equipment(status, location);
CREATE INDEX idx_service_records_date_status ON service_records(service_date, status);
CREATE INDEX idx_service_records_equipment_type ON service_records(equipment_id, service_type);

-- Optimize query with EXPLAIN
EXPLAIN SELECT
    e.name,
    sr.service_date,
    sr.cost
FROM equipment e
JOIN service_records sr ON e.id = sr.equipment_id
WHERE e.status = 'Operational'
    AND sr.service_date >= '2024-01-01'
    AND sr.service_type = 'Routine';

-- Use prepared statements for better performance and security
PREPARE stmt FROM 'SELECT * FROM equipment WHERE status = ? AND location = ?';
SET @status = 'Operational';
SET @location = 'Chicago';
EXECUTE stmt USING @status, @location;
DEALLOCATE PREPARE stmt;
```

---

## ⚡ Redis (The Super-Fast Filing Cabinet)

### 1. Caching Strategies

Using Redis to make the system faster:

```javascript
// Redis caching service
const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

class CacheService {
  // Cache equipment data
  async cacheEquipment(equipmentId, equipmentData, ttl = 3600) {
    const key = `equipment:${equipmentId}`;
    await client.setex(key, ttl, JSON.stringify(equipmentData));
    console.log(`Cached equipment ${equipmentId} for ${ttl} seconds`);
  }

  // Get cached equipment data
  async getCachedEquipment(equipmentId) {
    const key = `equipment:${equipmentId}`;
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache service records list
  async cacheServiceRecords(filters, data, ttl = 1800) {
    const key = `service_records:${JSON.stringify(filters)}`;
    await client.setex(key, ttl, JSON.stringify(data));
  }

  // Get cached service records
  async getCachedServiceRecords(filters) {
    const key = `service_records:${JSON.stringify(filters)}`;
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache user session data
  async cacheUserSession(userId, sessionData, ttl = 86400) {
    const key = `session:${userId}`;
    await client.setex(key, ttl, JSON.stringify(sessionData));
  }

  // Invalidate cache when data changes
  async invalidateEquipmentCache(equipmentId) {
    const patterns = [
      `equipment:${equipmentId}`,
      "equipment:list:*",
      "service_records:*",
    ];

    for (const pattern of patterns) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`Invalidated cache keys: ${keys.join(", ")}`);
      }
    }
  }

  // Rate limiting with Redis
  async checkRateLimit(userId, action, limit = 100, window = 3600) {
    const key = `rate_limit:${userId}:${action}`;
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, window);
    }

    return current <= limit;
  }
}

module.exports = new CacheService();
```

### 2. Real-time Data with Redis Pub/Sub

```javascript
// Real-time equipment status updates
const redis = require("redis");

const publisher = redis.createClient();
const subscriber = redis.createClient();

// Publish equipment status update
const publishEquipmentUpdate = async (equipmentId, status, location) => {
  const message = {
    equipmentId,
    status,
    location,
    timestamp: new Date().toISOString(),
  };

  await publisher.publish("equipment_updates", JSON.stringify(message));
  console.log(`Published equipment update: ${equipmentId}`);
};

// Subscribe to equipment updates
subscriber.subscribe("equipment_updates");
subscriber.on("message", (channel, message) => {
  if (channel === "equipment_updates") {
    const update = JSON.parse(message);
    console.log("Received equipment update:", update);

    // Broadcast to connected clients via WebSocket
    broadcastToClients(update);
  }
});

// Usage in API endpoints
app.put("/api/equipment/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    // Update in MySQL
    await Equipment.update(id, { status, location });

    // Publish to Redis
    await publishEquipmentUpdate(id, status, location);

    // Invalidate cache
    await cacheService.invalidateEquipmentCache(id);

    res.json({ success: true, message: "Equipment status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update equipment status" });
  }
});
```

---

## ❄️ Snowflake (The Data Warehouse)

### 1. Data Pipeline Setup

Setting up data flow from MySQL to Snowflake:

```sql
-- Snowflake schema for analytics
CREATE SCHEMA IF NOT EXISTS sis_analytics;

-- Equipment analytics table
CREATE TABLE sis_analytics.equipment_analytics (
    equipment_id INTEGER,
    equipment_name STRING,
    equipment_type STRING,
    location STRING,
    service_date DATE,
    service_type STRING,
    cost DECIMAL(10,2),
    labor_hours DECIMAL(4,2),
    technician_name STRING,
    days_since_last_service INTEGER,
    maintenance_frequency INTEGER,
    total_maintenance_cost DECIMAL(12,2),
    etl_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Service trends table
CREATE TABLE sis_analytics.service_trends (
    date DATE,
    equipment_type STRING,
    service_count INTEGER,
    avg_cost DECIMAL(10,2),
    total_labor_hours DECIMAL(8,2),
    avg_downtime_hours DECIMAL(4,2),
    etl_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Equipment performance metrics
CREATE TABLE sis_analytics.equipment_performance (
    equipment_id INTEGER,
    equipment_name STRING,
    uptime_percentage DECIMAL(5,2),
    avg_service_interval_days INTEGER,
    total_service_cost DECIMAL(12,2),
    reliability_score DECIMAL(3,2),
    etl_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

### 2. Analytics Queries

Complex analytical queries for insights:

```sql
-- Equipment reliability analysis
SELECT
    equipment_type,
    COUNT(*) as total_equipment,
    AVG(reliability_score) as avg_reliability,
    AVG(uptime_percentage) as avg_uptime,
    AVG(total_service_cost) as avg_total_cost
FROM sis_analytics.equipment_performance
WHERE etl_timestamp >= DATEADD(day, -30, CURRENT_DATE())
GROUP BY equipment_type
ORDER BY avg_reliability DESC;

-- Maintenance cost trends by month
SELECT
    DATE_TRUNC('month', service_date) as month,
    equipment_type,
    SUM(cost) as total_cost,
    COUNT(*) as service_count,
    AVG(cost) as avg_cost_per_service,
    LAG(SUM(cost)) OVER (PARTITION BY equipment_type ORDER BY DATE_TRUNC('month', service_date)) as prev_month_cost
FROM sis_analytics.equipment_analytics
WHERE service_date >= DATEADD(month, -12, CURRENT_DATE())
GROUP BY DATE_TRUNC('month', service_date), equipment_type
ORDER BY month DESC, total_cost DESC;

-- Predictive maintenance insights
WITH equipment_service_intervals AS (
    SELECT
        equipment_id,
        equipment_name,
        service_date,
        LAG(service_date) OVER (PARTITION BY equipment_id ORDER BY service_date) as prev_service_date,
        DATEDIFF(day, LAG(service_date) OVER (PARTITION BY equipment_id ORDER BY service_date), service_date) as days_between_services
    FROM sis_analytics.equipment_analytics
    WHERE service_type = 'Routine'
),
equipment_averages AS (
    SELECT
        equipment_id,
        equipment_name,
        AVG(days_between_services) as avg_service_interval,
        STDDEV(days_between_services) as service_interval_stddev
    FROM equipment_service_intervals
    WHERE days_between_services IS NOT NULL
    GROUP BY equipment_id, equipment_name
)
SELECT
    equipment_id,
    equipment_name,
    avg_service_interval,
    service_interval_stddev,
    avg_service_interval + (2 * service_interval_stddev) as recommended_next_service_days,
    CASE
        WHEN service_interval_stddev / avg_service_interval > 0.3 THEN 'High Variability'
        WHEN service_interval_stddev / avg_service_interval > 0.15 THEN 'Medium Variability'
        ELSE 'Low Variability'
    END as service_pattern_consistency
FROM equipment_averages
ORDER BY avg_service_interval DESC;
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "How would you optimize a slow MySQL query that's taking too long?"

**Answer:**
"When a query is slow, I'd follow a systematic approach to optimize it:

**Step 1: Analyze the query**

```sql
-- Use EXPLAIN to see the execution plan
EXPLAIN SELECT
    e.name,
    e.type,
    sr.service_date,
    sr.cost
FROM equipment e
JOIN service_records sr ON e.id = sr.equipment_id
WHERE e.status = 'Operational'
    AND sr.service_date >= '2024-01-01'
    AND e.location = 'Chicago';
```

**Step 2: Add appropriate indexes**

```sql
-- Create composite index for the WHERE conditions
CREATE INDEX idx_equipment_status_location ON equipment(status, location);

-- Create index for the JOIN and date filter
CREATE INDEX idx_service_records_equipment_date ON service_records(equipment_id, service_date);
```

**Step 3: Optimize the query structure**

```sql
-- Rewrite query to use index efficiently
SELECT
    e.name,
    e.type,
    sr.service_date,
    sr.cost
FROM equipment e
INNER JOIN service_records sr ON e.id = sr.equipment_id
WHERE e.status = 'Operational'
    AND e.location = 'Chicago'
    AND sr.service_date >= '2024-01-01'
ORDER BY sr.service_date DESC
LIMIT 1000;
```

**Step 4: Consider caching**

```javascript
// Cache frequently accessed data
const cacheKey = `equipment_services:operational:chicago:2024`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await query.execute();
await redis.setex(cacheKey, 3600, JSON.stringify(results));
```

Key optimization strategies:

1. **Proper indexing** - Most important
2. **Query rewriting** - Use efficient JOINs and WHERE clauses
3. **Caching** - For frequently accessed data
4. **Pagination** - Limit result sets
5. **Connection pooling** - Reuse database connections"

### Q2: "How would you handle database transactions for critical operations?"

**Answer:**
"For critical operations like updating equipment status and creating service records, I'd use database transactions to ensure data consistency:

```javascript
const mysql = require("mysql2/promise");

class DatabaseService {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      acquireTimeout: 60000,
      timeout: 60000,
    });
  }

  async performServiceUpdate(equipmentId, serviceData) {
    const connection = await this.pool.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Update equipment status
      await connection.execute(
        "UPDATE equipment SET status = ?, last_service_date = ?, next_service_date = ? WHERE id = ?",
        [
          serviceData.status,
          serviceData.serviceDate,
          serviceData.nextServiceDate,
          equipmentId,
        ]
      );

      // Create service record
      const [result] = await connection.execute(
        "INSERT INTO service_records (equipment_id, service_date, technician_id, service_type, description, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          equipmentId,
          serviceData.serviceDate,
          serviceData.technicianId,
          serviceData.serviceType,
          serviceData.description,
          serviceData.cost,
          "Completed",
        ]
      );

      // Update equipment maintenance history
      await connection.execute(
        "INSERT INTO maintenance_history (equipment_id, service_record_id, maintenance_type, performed_date) VALUES (?, ?, ?, ?)",
        [
          equipmentId,
          result.insertId,
          serviceData.serviceType,
          serviceData.serviceDate,
        ]
      );

      // Log the operation
      await connection.execute(
        "INSERT INTO audit_log (action, table_name, record_id, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())",
        ["UPDATE", "equipment", equipmentId, serviceData.userId]
      );

      // Commit transaction
      await connection.commit();

      console.log("Service update completed successfully");
      return { success: true, serviceRecordId: result.insertId };
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error("Service update failed, rolled back:", error);
      throw error;
    } finally {
      // Always release connection
      connection.release();
    }
  }

  // Batch operations with transaction
  async bulkUpdateEquipmentStatus(updates) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const update of updates) {
        await connection.execute(
          "UPDATE equipment SET status = ?, updated_at = NOW() WHERE id = ?",
          [update.status, update.equipmentId]
        );
      }

      await connection.commit();
      console.log(`Bulk updated ${updates.length} equipment records`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DatabaseService();
```

This approach ensures:

1. **ACID compliance** - All operations succeed or fail together
2. **Data consistency** - No partial updates
3. **Error recovery** - Automatic rollback on failure
4. **Performance** - Batch operations when possible"

### Q3: "How would you implement Redis caching for a high-traffic equipment lookup system?"

**Answer:**
"For a high-traffic system, I'd implement a multi-layered caching strategy with Redis:

```javascript
const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("Redis server refused connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

class EquipmentCacheService {
  constructor() {
    this.cachePrefixes = {
      equipment: "equipment",
      serviceRecords: "service_records",
      equipmentList: "equipment_list",
      userPermissions: "user_permissions",
    };

    // Cache TTL settings (in seconds)
    this.ttl = {
      equipment: 3600, // 1 hour
      serviceRecords: 1800, // 30 minutes
      equipmentList: 900, // 15 minutes
      userPermissions: 7200, // 2 hours
    };
  }

  // Multi-level caching for equipment data
  async getEquipment(equipmentId, userId) {
    const cacheKey = `${this.cachePrefixes.equipment}:${equipmentId}`;

    try {
      // Try cache first
      const cached = await client.get(cacheKey);
      if (cached) {
        const equipment = JSON.parse(cached);

        // Check user permissions from cache
        const hasAccess = await this.checkUserPermission(
          userId,
          equipmentId,
          "view"
        );
        if (hasAccess) {
          return equipment;
        } else {
          throw new Error("Access denied");
        }
      }

      // Cache miss - get from database
      const equipment = await this.fetchEquipmentFromDB(equipmentId);

      // Cache the result
      await client.setex(
        cacheKey,
        this.ttl.equipment,
        JSON.stringify(equipment)
      );

      // Cache user permission
      await this.cacheUserPermission(userId, equipmentId, "view");

      return equipment;
    } catch (error) {
      console.error("Cache error:", error);
      // Fallback to database
      return await this.fetchEquipmentFromDB(equipmentId);
    }
  }

  // Cache equipment list with filters
  async getEquipmentList(filters, userId) {
    const filterKey = this.generateFilterKey(filters);
    const cacheKey = `${this.cachePrefixes.equipmentList}:${filterKey}`;

    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      const equipment = await this.fetchEquipmentListFromDB(filters);

      // Cache with shorter TTL for lists
      await client.setex(
        cacheKey,
        this.ttl.equipmentList,
        JSON.stringify(equipment)
      );

      return equipment;
    } catch (error) {
      console.error("List cache error:", error);
      return await this.fetchEquipmentListFromDB(filters);
    }
  }

  // Cache invalidation strategy
  async invalidateEquipmentCache(equipmentId) {
    const patterns = [
      `${this.cachePrefixes.equipment}:${equipmentId}`,
      `${this.cachePrefixes.equipmentList}:*`,
      `${this.cachePrefixes.serviceRecords}:equipment:${equipmentId}`,
    ];

    for (const pattern of patterns) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(
          `Invalidated ${keys.length} cache keys for equipment ${equipmentId}`
        );
      }
    }
  }

  // Cache warming for frequently accessed data
  async warmCache() {
    console.log("Starting cache warming...");

    try {
      // Warm equipment list cache
      const popularFilters = [
        { status: "Operational", location: "Chicago" },
        { status: "Operational", location: "Peoria" },
        { type: "Excavator", status: "Operational" },
      ];

      for (const filters of popularFilters) {
        await this.getEquipmentList(filters);
      }

      // Warm frequently accessed equipment
      const popularEquipment = await this.getPopularEquipmentIds();
      for (const equipmentId of popularEquipment) {
        await this.getEquipment(equipmentId);
      }

      console.log("Cache warming completed");
    } catch (error) {
      console.error("Cache warming failed:", error);
    }
  }

  // Redis pipeline for batch operations
  async batchGetEquipment(equipmentIds) {
    const pipeline = client.pipeline();

    equipmentIds.forEach((id) => {
      pipeline.get(`${this.cachePrefixes.equipment}:${id}`);
    });

    const results = await pipeline.exec();
    const equipment = [];

    for (let i = 0; i < results.length; i++) {
      if (results[i][1]) {
        equipment.push(JSON.parse(results[i][1]));
      } else {
        // Cache miss - fetch from DB
        const dbEquipment = await this.fetchEquipmentFromDB(equipmentIds[i]);
        equipment.push(dbEquipment);

        // Cache it
        await client.setex(
          `${this.cachePrefixes.equipment}:${equipmentIds[i]}`,
          this.ttl.equipment,
          JSON.stringify(dbEquipment)
        );
      }
    }

    return equipment;
  }

  // Cache health monitoring
  async getCacheStats() {
    const info = await client.info("memory");
    const keyspace = await client.info("keyspace");

    return {
      memory: info,
      keyspace: keyspace,
      connected: client.connected,
    };
  }
}

module.exports = new EquipmentCacheService();
```

Key features:

1. **Multi-level caching** - Different TTL for different data types
2. **Permission-aware caching** - User access control
3. **Cache invalidation** - Smart invalidation on updates
4. **Cache warming** - Pre-load frequently accessed data
5. **Batch operations** - Redis pipeline for efficiency
6. **Error handling** - Graceful fallback to database
7. **Monitoring** - Cache health and performance metrics"

### Q4: "How would you design a data pipeline from MySQL to Snowflake for analytics?"

**Answer:**
"I'd design a robust ETL pipeline that handles data transformation and loading efficiently:

```javascript
// ETL Pipeline Service
const mysql = require("mysql2/promise");
const snowflake = require("snowflake-sdk");

class DataPipelineService {
  constructor() {
    this.mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    this.snowflakeConnection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USER,
      password: process.env.SNOWFLAKE_PASSWORD,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: "sis_analytics",
    });
  }

  // Extract data from MySQL
  async extractEquipmentData(lastSyncTime) {
    const query = `
            SELECT 
                e.id as equipment_id,
                e.name as equipment_name,
                e.type as equipment_type,
                e.model,
                e.serial_number,
                e.location,
                e.status,
                e.purchase_date,
                e.last_service_date,
                e.next_service_date,
                e.created_at,
                e.updated_at
            FROM equipment e
            WHERE e.updated_at > ?
            ORDER BY e.updated_at
        `;

    const [rows] = await this.mysqlPool.execute(query, [lastSyncTime]);
    return rows;
  }

  // Extract service records data
  async extractServiceRecordsData(lastSyncTime) {
    const query = `
            SELECT 
                sr.id as service_record_id,
                sr.equipment_id,
                e.name as equipment_name,
                e.type as equipment_type,
                e.location,
                sr.service_date,
                sr.service_type,
                sr.description,
                sr.cost,
                sr.labor_hours,
                sr.status,
                t.name as technician_name,
                t.specialization,
                sr.created_at,
                sr.updated_at
            FROM service_records sr
            JOIN equipment e ON sr.equipment_id = e.id
            JOIN technicians t ON sr.technician_id = t.id
            WHERE sr.updated_at > ?
            ORDER BY sr.updated_at
        `;

    const [rows] = await this.mysqlPool.execute(query, [lastSyncTime]);
    return rows;
  }

  // Transform data for analytics
  transformEquipmentData(rawData) {
    return rawData.map((record) => ({
      equipment_id: record.equipment_id,
      equipment_name: record.equipment_name,
      equipment_type: record.equipment_type,
      model: record.model,
      serial_number: record.serial_number,
      location: record.location,
      status: record.status,
      purchase_date: record.purchase_date,
      last_service_date: record.last_service_date,
      next_service_date: record.next_service_date,
      age_in_years: record.purchase_date
        ? Math.floor(
            (new Date() - new Date(record.purchase_date)) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      days_since_last_service: record.last_service_date
        ? Math.floor(
            (new Date() - new Date(record.last_service_date)) /
              (24 * 60 * 60 * 1000)
          )
        : null,
      days_until_next_service: record.next_service_date
        ? Math.floor(
            (new Date(record.next_service_date) - new Date()) /
              (24 * 60 * 60 * 1000)
          )
        : null,
      etl_timestamp: new Date().toISOString(),
    }));
  }

  // Load data to Snowflake
  async loadToSnowflake(tableName, data) {
    if (data.length === 0) {
      console.log(`No data to load for ${tableName}`);
      return;
    }

    return new Promise((resolve, reject) => {
      const connection = this.snowflakeConnection;

      connection.connect((err, conn) => {
        if (err) {
          console.error("Snowflake connection failed:", err);
          reject(err);
          return;
        }

        // Create temporary table for staging
        const tempTableName = `${tableName}_temp_${Date.now()}`;
        const createTempTable = `
                    CREATE TEMPORARY TABLE ${tempTableName} LIKE ${tableName}
                `;

        conn.execute({
          sqlText: createTempTable,
          complete: (err, stmt) => {
            if (err) {
              reject(err);
              return;
            }

            // Insert data in batches
            const batchSize = 1000;
            let currentBatch = 0;

            const insertBatch = () => {
              const batch = data.slice(currentBatch, currentBatch + batchSize);

              if (batch.length === 0) {
                // Merge temp table into main table
                const mergeQuery = `
                                    MERGE INTO ${tableName} AS target
                                    USING ${tempTableName} AS source
                                    ON target.equipment_id = source.equipment_id
                                    WHEN MATCHED THEN UPDATE SET
                                        equipment_name = source.equipment_name,
                                        equipment_type = source.equipment_type,
                                        status = source.status,
                                        last_service_date = source.last_service_date,
                                        etl_timestamp = source.etl_timestamp
                                    WHEN NOT MATCHED THEN INSERT VALUES
                                        (source.equipment_id, source.equipment_name, source.equipment_type, 
                                         source.model, source.serial_number, source.location, source.status,
                                         source.purchase_date, source.last_service_date, source.next_service_date,
                                         source.age_in_years, source.days_since_last_service, 
                                         source.days_until_next_service, source.etl_timestamp)
                                `;

                conn.execute({
                  sqlText: mergeQuery,
                  complete: (err, stmt) => {
                    if (err) {
                      reject(err);
                    } else {
                      console.log(
                        `Successfully loaded ${data.length} records to ${tableName}`
                      );
                      resolve();
                    }
                  },
                });
                return;
              }

              // Prepare insert statement
              const columns = Object.keys(batch[0]);
              const values = batch
                .map(
                  (row) =>
                    `(${columns.map((col) => `'${row[col]}'`).join(", ")})`
                )
                .join(", ");

              const insertQuery = `
                                INSERT INTO ${tempTableName} (${columns.join(
                ", "
              )})
                                VALUES ${values}
                            `;

              conn.execute({
                sqlText: insertQuery,
                complete: (err, stmt) => {
                  if (err) {
                    reject(err);
                  } else {
                    currentBatch += batchSize;
                    insertBatch();
                  }
                },
              });
            };

            insertBatch();
          },
        });
      });
    });
  }

  // Run complete ETL pipeline
  async runETLPipeline() {
    const startTime = new Date();
    console.log("Starting ETL pipeline...");

    try {
      // Get last sync time
      const lastSyncTime = await this.getLastSyncTime();

      // Extract data
      console.log("Extracting equipment data...");
      const equipmentData = await this.extractEquipmentData(lastSyncTime);
      console.log(`Extracted ${equipmentData.length} equipment records`);

      console.log("Extracting service records data...");
      const serviceData = await this.extractServiceRecordsData(lastSyncTime);
      console.log(`Extracted ${serviceData.length} service records`);

      // Transform data
      console.log("Transforming data...");
      const transformedEquipment = this.transformEquipmentData(equipmentData);
      const transformedServices = this.transformServiceData(serviceData);

      // Load to Snowflake
      console.log("Loading to Snowflake...");
      await this.loadToSnowflake("equipment_analytics", transformedEquipment);
      await this.loadToSnowflake(
        "service_records_analytics",
        transformedServices
      );

      // Update sync time
      await this.updateLastSyncTime(startTime);

      console.log("ETL pipeline completed successfully");
    } catch (error) {
      console.error("ETL pipeline failed:", error);
      throw error;
    }
  }

  // Schedule ETL pipeline
  scheduleETLPipeline() {
    // Run every 4 hours
    setInterval(() => {
      this.runETLPipeline().catch((error) => {
        console.error("Scheduled ETL pipeline failed:", error);
      });
    }, 4 * 60 * 60 * 1000);

    console.log("ETL pipeline scheduled to run every 4 hours");
  }
}

module.exports = new DataPipelineService();
```

This pipeline provides:

1. **Incremental updates** - Only process changed data
2. **Data transformation** - Calculate derived fields
3. **Batch processing** - Handle large datasets efficiently
4. **Error handling** - Robust error recovery
5. **Scheduling** - Automated data synchronization
6. **Monitoring** - Track pipeline performance"

---

## 🏆 Key Takeaways for Your Interview

1. **Master SQL Optimization** - Indexes, query planning, performance tuning
2. **Understand Caching Strategies** - Redis for speed, invalidation patterns
3. **Know Data Pipeline Design** - ETL processes, incremental updates
4. **Learn Transaction Management** - ACID properties, rollback strategies
5. **Practice Complex Queries** - JOINs, aggregations, window functions
6. **Understand Analytics** - Data warehousing, reporting queries

## 🎯 Practice Exercises

1. Write complex SQL queries for equipment analytics
2. Implement Redis caching for equipment lookups
3. Design a data pipeline from MySQL to Snowflake
4. Optimize slow database queries with proper indexing

Remember: Databases are the foundation of any enterprise application - master them to build robust, scalable systems! 🚀
