# System Design Preparation Module - Explained Like You're 5! 🏗️

## What is System Design? 🤔

Think of system design like planning a city! You need to decide where to put the roads (APIs), buildings (databases), power plants (servers), and traffic lights (load balancers). For Caterpillar's SIS 2.0, we're designing how all the computers and databases work together to help technicians service equipment.

## Why System Design for Caterpillar SIS 2.0? 🏗️

The SIS 2.0 system needs to handle thousands of technicians accessing equipment data, service records, and documentation simultaneously. Good system design ensures it works fast, never crashes, and can grow as more people use it.

---

## 🏛️ System Design Fundamentals

### 1. High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Admin Panel   │
│  (React Native) │    │   (Vue.js)      │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Azure)       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Node.js)     │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Equipment     │    │   Service       │    │   User          │
│   Service       │    │   Service       │    │   Service       │
│   (Node.js)     │    │   (Node.js)     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │ MySQL + Redis   │
                    │ + Snowflake     │
                    └─────────────────┘
```

### 2. Database Design

```sql
-- Core Tables for SIS 2.0
CREATE TABLE equipment (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),
    location VARCHAR(100),
    status ENUM('Operational', 'Maintenance', 'Offline'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE service_records (
    id INT PRIMARY KEY,
    equipment_id INT,
    service_date DATE,
    technician_id INT,
    service_type VARCHAR(50),
    description TEXT,
    cost DECIMAL(10,2),
    status VARCHAR(20),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE technicians (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    specialization VARCHAR(100),
    is_active BOOLEAN
);
```

### 3. API Design

```javascript
// RESTful API endpoints
GET    /api/equipment              // Get all equipment
GET    /api/equipment/:id          // Get specific equipment
POST   /api/equipment              // Create new equipment
PUT    /api/equipment/:id          // Update equipment
DELETE /api/equipment/:id          // Delete equipment

GET    /api/service-records        // Get service records
POST   /api/service-records        // Create service record
PUT    /api/service-records/:id    // Update service record

GET    /api/technicians            // Get technicians
GET    /api/technicians/:id        // Get specific technician

// WebSocket for real-time updates
WS     /ws/equipment-updates       // Real-time equipment status
WS     /ws/service-alerts          // Service notifications
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "Design a real-time equipment monitoring system for Caterpillar's SIS 2.0"

**Answer:**
"I'd design a system that can handle real-time updates from thousands of equipment pieces:

**Architecture Overview:**

```
Equipment → IoT Sensors → Message Queue → Processing Service → Database → WebSocket → Frontend
```

**Key Components:**

1. **IoT Data Ingestion**

```javascript
// Equipment sensors send data via MQTT
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://equipment-sensors.caterpillar.com");

client.on("message", async (topic, message) => {
  const equipmentData = JSON.parse(message);
  await processEquipmentUpdate(equipmentData);
});

async function processEquipmentUpdate(data) {
  // Validate data
  if (!data.equipmentId || !data.timestamp) return;

  // Store in Redis for real-time access
  await redis.setex(
    `equipment:${data.equipmentId}:status`,
    60,
    JSON.stringify(data)
  );

  // Update MySQL database
  await mysql.query(
    "UPDATE equipment SET status = ?, last_update = NOW() WHERE id = ?",
    [data.status, data.equipmentId]
  );

  // Broadcast to connected clients
  io.emit("equipment-update", data);
}
```

2. **Real-time WebSocket Service**

```javascript
// WebSocket server for real-time updates
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // Subscribe to equipment updates
  socket.on("subscribe-equipment", (equipmentIds) => {
    socket.join(`equipment-${equipmentIds.join("-")}`);
  });

  // Handle technician location updates
  socket.on("technician-location", async (location) => {
    await redis.setex(
      `technician:${location.technicianId}:location`,
      300,
      JSON.stringify(location)
    );
  });
});

// Broadcast equipment updates
function broadcastEquipmentUpdate(equipmentId, update) {
  io.to(`equipment-${equipmentId}`).emit("equipment-update", update);
}
```

3. **Caching Strategy**

```javascript
// Multi-level caching
class EquipmentCacheService {
  async getEquipmentStatus(equipmentId) {
    // L1: Memory cache (fastest)
    let status = this.memoryCache.get(equipmentId);
    if (status) return status;

    // L2: Redis cache (fast)
    status = await redis.get(`equipment:${equipmentId}:status`);
    if (status) {
      this.memoryCache.set(equipmentId, status, 30); // 30 seconds
      return JSON.parse(status);
    }

    // L3: Database (slowest)
    const result = await mysql.query("SELECT * FROM equipment WHERE id = ?", [
      equipmentId,
    ]);

    if (result.length > 0) {
      const equipment = result[0];
      await redis.setex(
        `equipment:${equipmentId}:status`,
        300,
        JSON.stringify(equipment)
      );
      this.memoryCache.set(equipmentId, equipment, 30);
      return equipment;
    }

    return null;
  }
}
```

**Scalability Considerations:**

- **Horizontal scaling**: Multiple processing services
- **Message queues**: Apache Kafka for high throughput
- **Database sharding**: By equipment type or location
- **CDN**: For static assets and documentation
- **Load balancing**: Distribute traffic across multiple servers"

### Q2: "How would you design a system to handle 10,000 concurrent technicians accessing equipment data?"

**Answer:**
"For 10,000 concurrent users, I'd implement a scalable, distributed architecture:

**Load Distribution:**

```
10,000 Users → Load Balancer → 20 API Servers (500 users each)
```

**Key Design Decisions:**

1. **Horizontal Scaling**

```javascript
// Auto-scaling configuration
const scalingConfig = {
  minInstances: 5,
  maxInstances: 50,
  targetCPU: 70,
  scaleUpThreshold: 80,
  scaleDownThreshold: 30,
};

// Load balancer health checks
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    instanceId: process.env.INSTANCE_ID,
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
  });
});
```

2. **Database Optimization**

```javascript
// Connection pooling
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100, // Max connections per server
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
});

// Read replicas for scaling reads
const readReplicas = [
  "mysql-read-1.azure.com",
  "mysql-read-2.azure.com",
  "mysql-read-3.azure.com",
];

const writeMaster = "mysql-master.azure.com";

class DatabaseService {
  async query(sql, params, useReadReplica = true) {
    const isReadQuery = sql.trim().toUpperCase().startsWith("SELECT");
    const host =
      isReadQuery && useReadReplica ? this.getReadReplica() : writeMaster;

    const connection = mysql.createConnection({ host, ...config });
    const result = await connection.execute(sql, params);
    connection.end();

    return result;
  }

  getReadReplica() {
    // Round-robin load balancing
    const index = Math.floor(Math.random() * readReplicas.length);
    return readReplicas[index];
  }
}
```

3. **Caching Strategy**

```javascript
// Redis cluster for high availability
const redis = require("redis");
const redisCluster = new redis.Cluster([
  { host: "redis-1.azure.com", port: 6380 },
  { host: "redis-2.azure.com", port: 6380 },
  { host: "redis-3.azure.com", port: 6380 },
]);

class CacheService {
  async getEquipmentList(filters) {
    const cacheKey = `equipment:list:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await redisCluster.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Cache miss - get from database
    const equipment = await databaseService.query(
      "SELECT * FROM equipment WHERE status = ? AND location = ?",
      [filters.status, filters.location]
    );

    // Cache for 5 minutes
    await redisCluster.setex(cacheKey, 300, JSON.stringify(equipment));

    return equipment;
  }
}
```

4. **Rate Limiting**

```javascript
// Distributed rate limiting with Redis
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");

const limiter = rateLimit({
  store: new RedisStore({
    client: redisCluster,
    prefix: "sis2:ratelimit:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window per IP
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

**Performance Optimizations:**

- **Database indexing**: On frequently queried fields
- **Query optimization**: Use prepared statements
- **Connection pooling**: Reuse database connections
- **CDN**: For static assets and images
- **Compression**: Gzip responses
- **Monitoring**: Real-time performance metrics"

### Q3: "Design a data pipeline for processing equipment sensor data and generating maintenance alerts"

**Answer:**
"I'd design a robust data pipeline using Azure services:

**Pipeline Architecture:**

```
IoT Sensors → Event Hubs → Stream Analytics → Azure Functions → Alerts → Notifications
```

**Implementation:**

1. **Data Ingestion**

```javascript
// Azure Event Hubs for high-throughput data ingestion
const { EventHubClient } = require("@azure/event-hubs");

class SensorDataIngestion {
  async processSensorData() {
    const client = EventHubClient.createFromConnectionString(
      process.env.EVENT_HUB_CONNECTION_STRING,
      process.env.EVENT_HUB_NAME
    );

    const partitionIds = await client.getPartitionIds();

    partitionIds.forEach(async (partitionId) => {
      const receiver = client.createReceiver("$Default", partitionId, {
        startAfterTime: Date.now(),
      });

      receiver.on("errorReceived", (err) => {
        console.error("Event Hub error:", err);
      });

      receiver.on("message", async (eventData) => {
        const sensorData = JSON.parse(eventData.body);
        await this.processSensorReading(sensorData);
      });
    });
  }

  async processSensorReading(data) {
    // Validate sensor data
    if (!this.validateSensorData(data)) return;

    // Store raw data
    await this.storeRawData(data);

    // Check for anomalies
    const anomaly = await this.detectAnomaly(data);
    if (anomaly) {
      await this.triggerMaintenanceAlert(data, anomaly);
    }
  }
}
```

2. **Stream Processing**

```javascript
// Azure Stream Analytics for real-time processing
// Stream Analytics Query (SQL-like)
SELECT
    equipmentId,
    AVG(temperature) as avgTemperature,
    AVG(vibration) as avgVibration,
    AVG(pressure) as avgPressure,
    System.Timestamp() as windowEnd
INTO
    [maintenance-alerts]
FROM
    [sensor-data]
GROUP BY
    equipmentId,
    TumblingWindow(minute, 5)
HAVING
    AVG(temperature) > 80 OR
    AVG(vibration) > 5.0 OR
    AVG(pressure) < 10
```

3. **Alert Generation**

```javascript
// Azure Function for processing alerts
const { AzureFunction } = require("@azure/functions");

module.exports = async function (context, req) {
  const alertData = req.body;

  // Determine alert severity
  const severity = determineSeverity(alertData);

  // Create maintenance record
  const maintenanceRecord = {
    equipmentId: alertData.equipmentId,
    alertType: "sensor_anomaly",
    severity: severity,
    description: generateAlertDescription(alertData),
    recommendedAction: getRecommendedAction(alertData),
    createdAt: new Date().toISOString(),
  };

  // Store in database
  await databaseService.createMaintenanceAlert(maintenanceRecord);

  // Send notifications
  await notificationService.sendAlert(maintenanceRecord);

  context.res = {
    status: 200,
    body: { success: true, alertId: maintenanceRecord.id },
  };
};

function determineSeverity(alertData) {
  const { temperature, vibration, pressure } = alertData;

  if (temperature > 90 || vibration > 7.0 || pressure < 5) {
    return "critical";
  } else if (temperature > 80 || vibration > 5.0 || pressure < 10) {
    return "high";
  } else {
    return "medium";
  }
}
```

4. **Notification Service**

```javascript
// Multi-channel notification service
class NotificationService {
  async sendAlert(alert) {
    const notifications = [];

    // Get relevant technicians
    const technicians = await this.getTechniciansForEquipment(
      alert.equipmentId
    );

    technicians.forEach((technician) => {
      notifications.push(
        this.sendPushNotification(technician, alert),
        this.sendEmail(technician, alert),
        this.sendSMS(technician, alert) // For critical alerts
      );
    });

    // Send to dashboard
    await this.broadcastToDashboard(alert);

    await Promise.all(notifications);
  }

  async sendPushNotification(technician, alert) {
    const message = {
      to: technician.deviceToken,
      title: `Equipment Alert: ${alert.equipmentId}`,
      body: alert.description,
      data: {
        equipmentId: alert.equipmentId,
        alertId: alert.id,
        severity: alert.severity,
      },
    };

    await messaging.send(message);
  }
}
```

**Data Flow:**

1. **Sensors** send data every 30 seconds
2. **Event Hubs** collects up to 1M messages/second
3. **Stream Analytics** processes data in 5-minute windows
4. **Azure Functions** generates alerts for anomalies
5. **Notifications** sent to technicians and dashboard
6. **Data** stored in Cosmos DB for historical analysis"

### Q4: "How would you ensure data consistency across multiple services in a microservices architecture?"

**Answer:**
"For a mission-critical system like SIS 2.0, data consistency is crucial. I'd implement several strategies:

**1. Event Sourcing Pattern**

```javascript
// Event store for maintaining data consistency
class EventStore {
  async saveEvent(aggregateId, eventType, eventData, version) {
    const event = {
      id: uuidv4(),
      aggregateId,
      eventType,
      eventData,
      version,
      timestamp: new Date().toISOString(),
    };

    await this.storeEvent(event);
    await this.publishEvent(event);
  }

  async getEvents(aggregateId) {
    return await this.query(
      `SELECT * FROM events WHERE aggregateId = ? ORDER BY version`,
      [aggregateId]
    );
  }
}

// Equipment aggregate
class EquipmentAggregate {
  constructor(events = []) {
    this.events = events;
    this.state = this.replayEvents(events);
  }

  replayEvents(events) {
    let state = { id: null, status: null, location: null };

    events.forEach((event) => {
      switch (event.eventType) {
        case "EquipmentCreated":
          state = { ...state, id: event.eventData.id, status: "Operational" };
          break;
        case "StatusChanged":
          state = { ...state, status: event.eventData.status };
          break;
        case "LocationUpdated":
          state = { ...state, location: event.eventData.location };
          break;
      }
    });

    return state;
  }

  changeStatus(newStatus) {
    if (this.state.status === newStatus) return;

    const event = {
      eventType: "StatusChanged",
      eventData: { status: newStatus },
      version: this.events.length + 1,
    };

    this.events.push(event);
    this.state.status = newStatus;
  }
}
```

**2. Saga Pattern for Distributed Transactions**

```javascript
// Saga orchestrator for complex operations
class ServiceSaga {
  async executeServiceUpdate(equipmentId, serviceData) {
    const sagaId = uuidv4();
    const steps = [
      { name: "updateEquipmentStatus", service: "equipment-service" },
      { name: "createServiceRecord", service: "service-service" },
      { name: "updateMaintenanceSchedule", service: "maintenance-service" },
      { name: "sendNotification", service: "notification-service" },
    ];

    const context = { sagaId, equipmentId, serviceData };

    try {
      for (const step of steps) {
        await this.executeStep(step, context);
      }

      await this.markSagaComplete(sagaId);
    } catch (error) {
      await this.compensate(sagaId, error);
    }
  }

  async executeStep(step, context) {
    const result = await this.callService(step.service, step.name, context);

    // Store step result for compensation if needed
    await this.storeStepResult(context.sagaId, step.name, result);

    return result;
  }

  async compensate(sagaId, error) {
    const completedSteps = await this.getCompletedSteps(sagaId);

    // Compensate in reverse order
    for (const step of completedSteps.reverse()) {
      try {
        await this.compensateStep(step);
      } catch (compError) {
        console.error("Compensation failed:", compError);
        // Log for manual intervention
      }
    }
  }
}
```

**3. Two-Phase Commit for Critical Operations**

```javascript
// Two-phase commit coordinator
class TwoPhaseCommitCoordinator {
  async executeTransaction(participants, operation) {
    const transactionId = uuidv4();
    const prepared = [];

    try {
      // Phase 1: Prepare
      for (const participant of participants) {
        const result = await participant.prepare(transactionId, operation);
        if (result.status !== "prepared") {
          throw new Error(`Participant ${participant.id} failed to prepare`);
        }
        prepared.push(participant);
      }

      // Phase 2: Commit
      for (const participant of prepared) {
        await participant.commit(transactionId);
      }

      return { success: true, transactionId };
    } catch (error) {
      // Rollback prepared participants
      for (const participant of prepared) {
        try {
          await participant.rollback(transactionId);
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }

      throw error;
    }
  }
}

// Participant implementation
class DatabaseParticipant {
  async prepare(transactionId, operation) {
    // Validate operation can be executed
    const canExecute = await this.validateOperation(operation);

    if (canExecute) {
      // Store transaction state
      await this.storeTransactionState(transactionId, "prepared", operation);
      return { status: "prepared" };
    } else {
      return { status: "failed", reason: "Validation failed" };
    }
  }

  async commit(transactionId) {
    const transaction = await this.getTransactionState(transactionId);
    await this.executeOperation(transaction.operation);
    await this.markTransactionComplete(transactionId);
  }

  async rollback(transactionId) {
    await this.cleanupTransaction(transactionId);
  }
}
```

**4. Eventual Consistency with Conflict Resolution**

```javascript
// Conflict resolution for eventual consistency
class ConflictResolver {
  async resolveConflict(entityId, localVersion, remoteVersion) {
    const localEntity = await this.getEntity(entityId, localVersion);
    const remoteEntity = await this.getEntity(entityId, remoteVersion);

    // Last-write-wins with timestamp
    if (localEntity.updatedAt > remoteEntity.updatedAt) {
      return { winner: "local", entity: localEntity };
    } else if (remoteEntity.updatedAt > localEntity.updatedAt) {
      return { winner: "remote", entity: remoteEntity };
    } else {
      // Same timestamp - merge strategy
      return {
        winner: "merged",
        entity: this.mergeEntities(localEntity, remoteEntity),
      };
    }
  }

  mergeEntities(local, remote) {
    // Custom merge logic based on business rules
    return {
      ...local,
      ...remote,
      status: this.mergeStatus(local.status, remote.status),
      location: this.mergeLocation(local.location, remote.location),
    };
  }
}
```

This approach ensures:

- **Eventual consistency** through event sourcing
- **Distributed transactions** via saga pattern
- **Critical consistency** through two-phase commit
- **Conflict resolution** for concurrent updates"

---

## 🏆 Key Takeaways

1. **Start with Requirements** - Understand scale, performance, and reliability needs
2. **Design for Scale** - Horizontal scaling, load balancing, caching
3. **Plan for Failures** - Redundancy, circuit breakers, graceful degradation
4. **Consider Data Consistency** - Choose appropriate consistency model
5. **Monitor Everything** - Metrics, logging, alerting
6. **Security First** - Authentication, authorization, data protection

## 🎯 Practice Exercises

1. Design a real-time dashboard for equipment monitoring
2. Plan a microservices architecture for SIS 2.0
3. Design a data pipeline for IoT sensor data
4. Create a disaster recovery plan for the system

Remember: System design is about making trade-offs and explaining your reasoning! 🚀
