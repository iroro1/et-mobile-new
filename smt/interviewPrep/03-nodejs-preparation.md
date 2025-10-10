# Node.js Preparation Module - Explained Like You're 5! 🟢

## What is Node.js? 🤔

Think of Node.js like a super-fast waiter in a restaurant! Instead of having one waiter who can only serve one table at a time, Node.js can serve hundreds of tables (requests) at the same time without getting tired. It's like having a waiter with superpowers!

## Why Node.js for Caterpillar SIS 2.0? 🏗️

Caterpillar uses Node.js as their **backend technology** to handle all the behind-the-scenes work for the SIS 2.0 system. It's like the engine that powers the entire service information system, handling data, APIs, and making sure everything runs smoothly.

---

## 🚀 Node.js Fundamentals (The Super Waiter's Skills)

### 1. Basic Server Setup (Setting Up the Restaurant)

Creating a simple server that can handle requests:

```javascript
// server.js
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Basic route - like a menu item
app.get("/", (req, res) => {
  res.json({ message: "Welcome to SIS 2.0 API!" });
});

// Equipment route - get all equipment
app.get("/api/equipment", (req, res) => {
  const equipment = [
    { id: 1, name: "CAT 320 Excavator", status: "Operational" },
    { id: 2, name: "CAT 140M Grader", status: "Maintenance" },
  ];
  res.json(equipment);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 2. Express.js Framework (The Restaurant's Rules)

Express.js makes building APIs much easier:

```javascript
// routes/equipment.js
const express = require("express");
const router = express.Router();

// GET /api/equipment - Get all equipment
router.get("/", async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
});

// GET /api/equipment/:id - Get specific equipment
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
});

// POST /api/equipment - Create new equipment
router.post("/", async (req, res) => {
  try {
    const { name, type, location } = req.body;

    // Validation
    if (!name || !type || !location) {
      return res.status(400).json({
        error: "Name, type, and location are required",
      });
    }

    const equipment = await Equipment.create({ name, type, location });
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create equipment" });
  }
});

module.exports = router;
```

### 3. Middleware (The Restaurant's Security Guards)

Middleware functions that run before your main code:

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next(); // Move to the next middleware or route handler
  });
};

// middleware/validation.js
const validateServiceRecord = (req, res, next) => {
  const { equipmentId, serviceDate, technician, description } = req.body;

  const errors = [];

  if (!equipmentId) errors.push("Equipment ID is required");
  if (!serviceDate) errors.push("Service date is required");
  if (!technician) errors.push("Technician name is required");
  if (!description) errors.push("Description is required");

  // Validate date format
  if (serviceDate && isNaN(Date.parse(serviceDate))) {
    errors.push("Invalid date format");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Database connection error
  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "Database connection failed",
    });
  }

  // Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.message,
    });
  }

  // Default error
  res.status(500).json({
    error: "Something went wrong!",
  });
};

module.exports = { authenticateToken, validateServiceRecord, errorHandler };
```

### 4. Database Integration (Talking to the Kitchen)

Connecting to databases and handling data:

```javascript
// models/Equipment.js
const mysql = require("mysql2/promise");

class Equipment {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async findAll() {
    const [rows] = await this.pool.execute(
      "SELECT * FROM equipment ORDER BY name"
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      "SELECT * FROM equipment WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  async create(equipmentData) {
    const { name, type, location, status = "Operational" } = equipmentData;

    const [result] = await this.pool.execute(
      "INSERT INTO equipment (name, type, location, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, type, location, status]
    );

    return { id: result.insertId, name, type, location, status };
  }

  async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(id);

    await this.pool.execute(
      `UPDATE equipment SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id) {
    await this.pool.execute("DELETE FROM equipment WHERE id = ?", [id]);
    return true;
  }
}

module.exports = new Equipment();
```

### 5. Async/Await and Promises (Waiting for Orders)

Handling asynchronous operations properly:

```javascript
// services/equipmentService.js
const Equipment = require("../models/Equipment");
const Redis = require("redis");

class EquipmentService {
  constructor() {
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
  }

  async getEquipmentWithCache(id) {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(`equipment:${id}`);
      if (cached) {
        console.log("Cache hit for equipment:", id);
        return JSON.parse(cached);
      }

      // If not in cache, get from database
      console.log("Cache miss for equipment:", id);
      const equipment = await Equipment.findById(id);

      if (equipment) {
        // Store in cache for 1 hour
        await this.redis.setex(
          `equipment:${id}`,
          3600,
          JSON.stringify(equipment)
        );
      }

      return equipment;
    } catch (error) {
      console.error("Error in getEquipmentWithCache:", error);
      throw error;
    }
  }

  async updateEquipmentStatus(id, newStatus) {
    try {
      // Update in database
      const updatedEquipment = await Equipment.update(id, {
        status: newStatus,
      });

      // Update cache
      await this.redis.setex(
        `equipment:${id}`,
        3600,
        JSON.stringify(updatedEquipment)
      );

      // Invalidate related caches
      await this.redis.del("equipment:list");

      return updatedEquipment;
    } catch (error) {
      console.error("Error updating equipment status:", error);
      throw error;
    }
  }

  async getEquipmentList() {
    try {
      // Try cache first
      const cached = await this.redis.get("equipment:list");
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      const equipment = await Equipment.findAll();

      // Cache for 30 minutes
      await this.redis.setex("equipment:list", 1800, JSON.stringify(equipment));

      return equipment;
    } catch (error) {
      console.error("Error getting equipment list:", error);
      throw error;
    }
  }
}

module.exports = new EquipmentService();
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "Explain the difference between synchronous and asynchronous operations in Node.js."

**Answer:**
"Great question! Let me explain with a restaurant analogy:

**Synchronous (Blocking):** Like a waiter who takes one order, goes to the kitchen, waits for the food to be ready, brings it back, and only then takes the next order. Very slow!

```javascript
// Synchronous - BLOCKS everything
console.log("Taking order 1");
const result1 = fetchDataFromDatabase(); // Takes 2 seconds
console.log("Order 1 complete");

console.log("Taking order 2");
const result2 = fetchDataFromDatabase(); // Takes 2 seconds
console.log("Order 2 complete");

// Total time: 4 seconds
```

**Asynchronous (Non-blocking):** Like a waiter who takes all orders first, then checks back with the kitchen when food is ready. Much faster!

```javascript
// Asynchronous - DOESN'T block
console.log("Taking all orders");

const promise1 = fetchDataFromDatabase(); // Starts immediately
const promise2 = fetchDataFromDatabase(); // Starts immediately

// Both run at the same time
const [result1, result2] = await Promise.all([promise1, promise2]);

console.log("All orders complete");
// Total time: 2 seconds (both run simultaneously)
```

Node.js is built for asynchronous operations, which is why it can handle thousands of requests efficiently."

### Q2: "How would you handle errors in a Node.js API for a mission-critical system?"

**Answer:**
"For a mission-critical system like SIS 2.0, error handling is crucial. I'd implement a comprehensive error handling strategy:

```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for monitoring
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send to error monitoring service
  if (process.env.NODE_ENV === "production") {
    // Send to Sentry, DataDog, etc.
    console.error("Production error logged to monitoring service");
  }

  // Handle specific error types
  if (err.name === "CastError") {
    error = new AppError("Invalid ID format", 400);
  }

  if (err.code === 11000) {
    error = new AppError("Duplicate field value", 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ValidationError(message);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Usage in routes
app.get("/api/equipment/:id", async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return next(new AppError("Equipment not found", 404));
    }

    res.json(equipment);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

app.use(errorHandler);
```

This approach ensures:

1. **Graceful error handling** - No crashes
2. **Proper error logging** - For debugging
3. **User-friendly messages** - Don't expose internals
4. **Monitoring integration** - Track errors in production"

### Q3: "How would you implement authentication and authorization in a Node.js API?"

**Answer:**
"I'd implement a robust JWT-based authentication system with role-based access control:

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

// routes/auth.js
const express = require("express");
const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Register (admin only)
router.post(
  "/register",
  authenticateToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { name, email, password, role, permissions } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        permissions,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// Usage in protected routes
router.get("/api/equipment", authenticateToken, async (req, res) => {
  // Only authenticated users can access
});

router.post(
  "/api/equipment",
  authenticateToken,
  authorize("admin", "supervisor"),
  async (req, res) => {
    // Only admins and supervisors can create equipment
  }
);

router.delete(
  "/api/equipment/:id",
  authenticateToken,
  authorize("admin"),
  async (req, res) => {
    // Only admins can delete equipment
  }
);

module.exports = router;
```

This system provides:

1. **Secure authentication** - JWT tokens with expiration
2. **Role-based authorization** - Different access levels
3. **Password security** - Bcrypt hashing
4. **Flexible permissions** - Granular access control"

### Q4: "How would you optimize a Node.js API for handling high traffic?"

**Answer:**
"For high-traffic scenarios in a mission-critical system, I'd implement several optimization strategies:

```javascript
// Rate limiting
const rateLimit = require("express-rate-limit");

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limits for different endpoints
const generalLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  "Too many requests from this IP"
);

const authLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  "Too many login attempts"
);

// Caching middleware
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default

const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      console.log("Cache hit for:", req.originalUrl);
      return res.json(cached);
    }

    // Store original res.json
    const originalJson = res.json;

    res.json = function (data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };

    next();
  };
};

// Database connection pooling
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Increased for high traffic
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
});

// Compression middleware
const compression = require("compression");

// Request validation middleware
const Joi = require("joi");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

// Equipment validation schema
const equipmentSchema = Joi.object({
  name: Joi.string().required().max(100),
  type: Joi.string().required().max(50),
  location: Joi.string().required().max(100),
  status: Joi.string().valid("Operational", "Maintenance", "Offline"),
});

// Optimized equipment routes
app.use("/api", generalLimit);
app.use("/api/auth/login", authLimit);

app.use(compression()); // Enable gzip compression

// Cached routes
app.get(
  "/api/equipment",
  cacheMiddleware(300), // Cache for 5 minutes
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM equipment WHERE status = ? ORDER BY name",
        ["Operational"]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  }
);

// Non-cached routes (frequently changing data)
app.post(
  "/api/equipment",
  authenticateToken,
  authorize("admin", "supervisor"),
  validateRequest(equipmentSchema),
  async (req, res) => {
    try {
      const { name, type, location, status } = req.body;

      const [result] = await pool.execute(
        "INSERT INTO equipment (name, type, location, status) VALUES (?, ?, ?, ?)",
        [name, type, location, status || "Operational"]
      );

      // Invalidate cache
      cache.del("cache:/api/equipment");

      res.status(201).json({
        id: result.insertId,
        name,
        type,
        location,
        status,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create equipment" });
    }
  }
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

Key optimizations:

1. **Rate limiting** - Prevent abuse
2. **Caching** - Reduce database load
3. **Connection pooling** - Efficient database connections
4. **Compression** - Reduce bandwidth
5. **Input validation** - Prevent invalid requests
6. **Health checks** - Monitor system status"

---

## 🏆 Key Takeaways for Your Interview

1. **Master Async/Await** - Handle asynchronous operations properly
2. **Understand Middleware** - Request processing pipeline
3. **Learn Error Handling** - Graceful failure management
4. **Know Database Integration** - MySQL, Redis connections
5. **Practice Security** - Authentication, validation, rate limiting
6. **Understand Performance** - Caching, compression, optimization

## 🎯 Practice Exercises

1. Build a RESTful API for equipment management
2. Implement authentication and authorization
3. Add caching and rate limiting
4. Create error handling and logging systems

Remember: Node.js is all about building fast, scalable, and reliable backend services! 🚀
