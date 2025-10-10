# Azure Cloud Preparation Module - Explained Like You're 5! ☁️

## What is Azure Cloud? 🤔

Think of Azure Cloud like having a giant computer in the sky! Instead of buying your own computers and servers, you can rent them from Microsoft. It's like having a super-powered computer that can grow bigger or smaller depending on how much work you need to do, and it's always available from anywhere in the world!

## Why Azure Cloud for Caterpillar SIS 2.0? 🏗️

Caterpillar uses Azure Cloud to host their SIS 2.0 system because it's:

- **Reliable**: Like having a backup generator that never fails
- **Scalable**: Can handle more users when busy, use less resources when quiet
- **Secure**: Like having the best security guards protecting your data
- **Global**: Works fast from anywhere in the world

---

## 🌐 Azure Fundamentals (The Cloud Building Blocks)

### 1. Azure App Service (Your Web App's Home)

Hosting your Node.js application in the cloud:

```javascript
// app.js - Express app configured for Azure
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Health check endpoint for Azure
app.get("/health", (req, res) => {
  res.json({
    status: "Healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    region: process.env.WEBSITE_SITE_NAME || "local",
  });
});

// API routes
app.use("/api/equipment", require("./routes/equipment"));
app.use("/api/service", require("./routes/service"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SIS 2.0 API running on port ${PORT}`);
});

module.exports = app;
```

### 2. Azure Database Services (Data Storage in the Cloud)

Connecting to Azure MySQL and Redis:

```javascript
// config/database.js
const mysql = require("mysql2/promise");
const redis = require("redis");

// Azure MySQL connection
const azureMySQLConfig = {
  host: process.env.AZURE_MYSQL_HOST, // e.g., sis2-mysql.mysql.database.azure.com
  user: process.env.AZURE_MYSQL_USER,
  password: process.env.AZURE_MYSQL_PASSWORD,
  database: process.env.AZURE_MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.AZURE_MYSQL_SSL_CA,
  },
  port: 3306,
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
};

const mysqlPool = mysql.createPool(azureMySQLConfig);

// Azure Redis Cache connection
const azureRedisConfig = {
  host: process.env.AZURE_REDIS_HOST, // e.g., sis2-redis.redis.cache.windows.net
  port: 6380, // SSL port for Azure Redis
  password: process.env.AZURE_REDIS_KEY,
  tls: {
    servername: process.env.AZURE_REDIS_HOST,
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("Redis server refused connection");
    }
    return Math.min(options.attempt * 100, 3000);
  },
};

const redisClient = redis.createClient(azureRedisConfig);

// Test connections
const testConnections = async () => {
  try {
    // Test MySQL connection
    const [rows] = await mysqlPool.execute("SELECT 1 as test");
    console.log("✅ Azure MySQL connected successfully");

    // Test Redis connection
    await redisClient.ping();
    console.log("✅ Azure Redis connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

module.exports = {
  mysqlPool,
  redisClient,
  testConnections,
};
```

### 3. Azure Key Vault (Secret Storage)

Securely storing sensitive information:

```javascript
// services/keyVaultService.js
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

class KeyVaultService {
  constructor() {
    this.credential = new DefaultAzureCredential();
    this.vaultUrl = process.env.AZURE_KEY_VAULT_URL;
    this.client = new SecretClient(this.vaultUrl, this.credential);
  }

  async getSecret(secretName) {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw error;
    }
  }

  async getDatabaseCredentials() {
    const [host, user, password, database] = await Promise.all([
      this.getSecret("mysql-host"),
      this.getSecret("mysql-username"),
      this.getSecret("mysql-password"),
      this.getSecret("mysql-database"),
    ]);

    return { host, user, password, database };
  }

  async getRedisCredentials() {
    const [host, key] = await Promise.all([
      this.getSecret("redis-host"),
      this.getSecret("redis-key"),
    ]);

    return { host, key };
  }

  async getJWTSecret() {
    return await this.getSecret("jwt-secret");
  }
}

module.exports = new KeyVaultService();
```

### 4. Azure Storage (File Storage in the Cloud)

Storing files and documents:

```javascript
// services/storageService.js
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

class StorageService {
  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    this.containerName = "sis-documents";

    const credential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey
    );
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      credential
    );

    this.containerClient = this.blobServiceClient.getContainerClient(
      this.containerName
    );
  }

  async uploadServiceDocument(file, equipmentId, serviceRecordId) {
    try {
      const fileName = `equipment-${equipmentId}/service-${serviceRecordId}/${file.originalname}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
        metadata: {
          equipmentId: equipmentId.toString(),
          serviceRecordId: serviceRecordId.toString(),
          uploadedAt: new Date().toISOString(),
        },
      };

      const uploadResult = await blockBlobClient.upload(
        file.buffer,
        file.size,
        uploadOptions
      );

      return {
        url: uploadResult.url,
        fileName: fileName,
        size: file.size,
      };
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  }

  async downloadDocument(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      const downloadResult = await blockBlobClient.download();
      return downloadResult.readableStreamBody;
    } catch (error) {
      console.error("Failed to download document:", error);
      throw error;
    }
  }

  async listServiceDocuments(equipmentId) {
    try {
      const prefix = `equipment-${equipmentId}/`;
      const listOptions = { prefix };

      const documents = [];
      for await (const blob of this.containerClient.listBlobsFlat(
        listOptions
      )) {
        documents.push({
          name: blob.name,
          url: `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blob.name}`,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          contentType: blob.properties.contentType,
        });
      }

      return documents;
    } catch (error) {
      console.error("Failed to list documents:", error);
      throw error;
    }
  }

  async deleteDocument(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  }
}

module.exports = new StorageService();
```

---

## 🚀 Azure DevOps (Building and Deploying)

### 1. Azure DevOps Pipeline (Automated Deployment)

Setting up CI/CD for the SIS 2.0 application:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

variables:
  nodeVersion: "18.x"
  azureServiceConnection: "SIS2-Azure-Connection"
  appName: "sis2-webapp"
  resourceGroupName: "sis2-resources"

pool:
  vmImage: "ubuntu-latest"

stages:
  - stage: Build
    displayName: "Build and Test"
    jobs:
      - job: BuildJob
        displayName: "Build Application"
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: "Install Node.js"

          - script: |
              npm install
              npm run build
            displayName: "Install dependencies and build"

          - script: |
              npm run test
              npm run lint
            displayName: "Run tests and linting"

          - task: PublishTestResults@2
            inputs:
              testResultsFormat: "JUnit"
              testResultsFiles: "test-results.xml"
            condition: succeededOrFailed()

          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: "Cobertura"
              summaryFileLocation: "coverage/cobertura-coverage.xml"

  - stage: Deploy
    displayName: "Deploy to Azure"
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployJob
        displayName: "Deploy to Azure App Service"
        environment: "production"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: $(azureServiceConnection)
                    appType: "webApp"
                    appName: $(appName)
                    resourceGroupName: $(resourceGroupName)
                    package: "$(System.DefaultWorkingDirectory)/**/*.zip"

                - task: AzureCLI@2
                  inputs:
                    azureSubscription: $(azureServiceConnection)
                    scriptType: "bash"
                    scriptLocation: "inlineScript"
                    inlineScript: |
                      # Update application settings
                      az webapp config appsettings set \
                        --name $(appName) \
                        --resource-group $(resourceGroupName) \
                        --settings \
                          NODE_ENV=production \
                          AZURE_MYSQL_HOST=$(AZURE_MYSQL_HOST) \
                          AZURE_REDIS_HOST=$(AZURE_REDIS_HOST)

                      # Restart the application
                      az webapp restart --name $(appName) --resource-group $(resourceGroupName)
```

### 2. Azure Application Insights (Monitoring)

Monitoring application performance and errors:

```javascript
// monitoring/appInsights.js
const appInsights = require("applicationinsights");

class MonitoringService {
  constructor() {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();

    this.client = appInsights.defaultClient;
  }

  trackCustomEvent(eventName, properties = {}) {
    this.client.trackEvent({
      name: eventName,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  trackEquipmentService(equipmentId, serviceType, duration, success) {
    this.trackCustomEvent("EquipmentService", {
      equipmentId,
      serviceType,
      duration,
      success,
    });

    // Track metrics
    this.client.trackMetric({
      name: "Service Duration",
      value: duration,
    });

    this.client.trackMetric({
      name: "Service Success Rate",
      value: success ? 1 : 0,
    });
  }

  trackUserAction(userId, action, details = {}) {
    this.trackCustomEvent("UserAction", {
      userId,
      action,
      ...details,
    });
  }

  trackError(error, context = {}) {
    this.client.trackException({
      exception: error,
      properties: {
        timestamp: new Date().toISOString(),
        ...context,
      },
    });
  }

  trackDependency(dependencyName, commandName, duration, success) {
    this.client.trackDependency({
      name: dependencyName,
      commandName,
      duration,
      success,
    });
  }
}

// Middleware for automatic request tracking
const monitoringMiddleware = (monitoringService) => {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;

      monitoringService.client.trackRequest({
        name: `${req.method} ${req.route?.path || req.path}`,
        url: req.originalUrl,
        duration,
        resultCode: res.statusCode,
        success: res.statusCode < 400,
      });
    });

    next();
  };
};

module.exports = { MonitoringService, monitoringMiddleware };
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "How would you deploy a Node.js application to Azure App Service?"

**Answer:**
"I'd deploy a Node.js application to Azure App Service using a comprehensive approach:

**Step 1: Prepare the application for Azure**

```javascript
// package.json - Ensure proper scripts
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install --production",
    "test": "jest",
    "lint": "eslint ."
  },
  "engines": {
    "node": "18.x"
  }
}

// server.js - Configure for Azure
const express = require('express');
const app = express();

// Azure-specific configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.get('/health', (req, res) => {
    res.json({
        status: 'Healthy',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Step 2: Azure CLI deployment**

```bash
# Create resource group
az group create --name sis2-resources --location eastus

# Create App Service plan
az appservice plan create --name sis2-plan --resource-group sis2-resources --sku B1

# Create web app
az webapp create --resource-group sis2-resources --plan sis2-plan --name sis2-webapp --runtime "NODE|18-lts"

# Configure application settings
az webapp config appsettings set --name sis2-webapp --resource-group sis2-resources --settings \
    NODE_ENV=production \
    AZURE_MYSQL_HOST=sis2-mysql.mysql.database.azure.com \
    AZURE_REDIS_HOST=sis2-redis.redis.cache.windows.net

# Deploy code
az webapp deployment source config --name sis2-webapp --resource-group sis2-resources --repo-url https://github.com/caterpillar/sis2 --branch main
```

**Step 3: Azure DevOps Pipeline**

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: "ubuntu-latest"

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: "18.x"

  - script: |
      npm install
      npm run build
    displayName: "Build application"

  - task: AzureWebApp@1
    inputs:
      azureSubscription: "SIS2-Azure-Connection"
      appType: "webApp"
      appName: "sis2-webapp"
      resourceGroupName: "sis2-resources"
      package: "$(System.DefaultWorkingDirectory)/**/*.zip"
```

This approach ensures:

1. **Automated deployment** - No manual intervention
2. **Environment consistency** - Same process for all environments
3. **Rollback capability** - Easy to revert if issues occur
4. **Monitoring** - Track deployment success/failure"

### Q2: "How would you implement monitoring and logging for an Azure-hosted application?"

**Answer:**
"For a mission-critical system like SIS 2.0, I'd implement comprehensive monitoring using Azure's native services:

**Application Insights Integration**

```javascript
// monitoring/azureMonitoring.js
const appInsights = require("applicationinsights");

class AzureMonitoringService {
  constructor() {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setSendLiveMetrics(true)
      .start();

    this.client = appInsights.defaultClient;
  }

  // Custom telemetry for business metrics
  trackEquipmentService(equipmentId, serviceType, duration, cost, success) {
    this.client.trackEvent({
      name: "EquipmentServiceCompleted",
      properties: {
        equipmentId: equipmentId.toString(),
        serviceType,
        cost: cost.toString(),
        success: success.toString(),
        timestamp: new Date().toISOString(),
      },
    });

    // Track custom metrics
    this.client.trackMetric({
      name: "Service Duration",
      value: duration,
      properties: { serviceType },
    });

    this.client.trackMetric({
      name: "Service Cost",
      value: cost,
      properties: { equipmentId: equipmentId.toString() },
    });
  }

  // Track user actions for analytics
  trackUserAction(userId, action, metadata = {}) {
    this.client.trackEvent({
      name: "UserAction",
      properties: {
        userId,
        action,
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Track errors with context
  trackError(error, context = {}) {
    this.client.trackException({
      exception: error,
      properties: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  }
}

// Middleware for automatic request tracking
const monitoringMiddleware = (monitoringService) => {
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers["x-request-id"] || "unknown";

    // Track request start
    monitoringService.client.trackRequest({
      name: `${req.method} ${req.route?.path || req.path}`,
      url: req.originalUrl,
      properties: {
        requestId,
        userId: req.user?.id,
        userAgent: req.headers["user-agent"],
      },
    });

    res.on("finish", () => {
      const duration = Date.now() - startTime;

      // Track request completion
      monitoringService.client.trackRequest({
        name: `${req.method} ${req.route?.path || req.path}`,
        url: req.originalUrl,
        duration,
        resultCode: res.statusCode,
        success: res.statusCode < 400,
        properties: {
          requestId,
          userId: req.user?.id,
        },
      });
    });

    next();
  };
};

module.exports = { AzureMonitoringService, monitoringMiddleware };
```

**Log Analytics Workspace**

```javascript
// logging/azureLogging.js
const winston = require("winston");
const { LogAnalyticsTransport } = require("winston-azure-loganalytics");

class AzureLoggingService {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),

        // Azure Log Analytics transport
        new LogAnalyticsTransport({
          customerId: process.env.LOG_ANALYTICS_CUSTOMER_ID,
          sharedKey: process.env.LOG_ANALYTICS_SHARED_KEY,
          logType: "SIS2ApplicationLogs",
        }),
      ],
    });
  }

  logEquipmentService(equipmentId, serviceType, details) {
    this.logger.info("Equipment service completed", {
      equipmentId,
      serviceType,
      ...details,
      category: "EquipmentService",
    });
  }

  logUserAction(userId, action, details) {
    this.logger.info("User action", {
      userId,
      action,
      ...details,
      category: "UserAction",
    });
  }

  logError(error, context) {
    this.logger.error("Application error", {
      error: error.message,
      stack: error.stack,
      ...context,
      category: "Error",
    });
  }

  logPerformance(operation, duration, metadata) {
    this.logger.info("Performance metric", {
      operation,
      duration,
      ...metadata,
      category: "Performance",
    });
  }
}

module.exports = new AzureLoggingService();
```

**Azure Monitor Alerts**

```json
{
  "location": "global",
  "properties": {
    "description": "Alert when error rate exceeds 5%",
    "severity": 2,
    "enabled": true,
    "scopes": [
      "/subscriptions/{subscription-id}/resourceGroups/sis2-resources/providers/Microsoft.Web/sites/sis2-webapp"
    ],
    "evaluationFrequency": "PT5M",
    "windowSize": "PT15M",
    "criteria": {
      "allOf": [
        {
          "query": "requests | where success == false | summarize errorCount = count() by bin(timestamp, 5m)",
          "metricName": "errorCount",
          "operator": "GreaterThan",
          "threshold": 10,
          "timeAggregation": "Count"
        }
      ]
    },
    "actions": [
      {
        "actionGroupId": "/subscriptions/{subscription-id}/resourceGroups/sis2-resources/providers/microsoft.insights/actionGroups/email-alerts"
      }
    ]
  }
}
```

This monitoring setup provides:

1. **Real-time monitoring** - Application Insights dashboards
2. **Error tracking** - Automatic exception collection
3. **Performance metrics** - Request duration, dependency tracking
4. **Business metrics** - Custom telemetry for equipment services
5. **Alerting** - Proactive issue detection
6. **Log analysis** - Centralized logging with Log Analytics"

### Q3: "How would you implement security for an Azure-hosted application?"

**Answer:**
"For a mission-critical system like SIS 2.0, security is paramount. I'd implement a multi-layered security approach:

**Azure Key Vault Integration**

```javascript
// security/keyVaultService.js
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

class SecurityService {
  constructor() {
    this.credential = new DefaultAzureCredential();
    this.vaultUrl = process.env.AZURE_KEY_VAULT_URL;
    this.secretClient = new SecretClient(this.vaultUrl, this.credential);
  }

  async getDatabaseCredentials() {
    const [host, user, password, database] = await Promise.all([
      this.getSecret("mysql-host"),
      this.getSecret("mysql-username"),
      this.getSecret("mysql-password"),
      this.getSecret("mysql-database"),
    ]);
    return { host, user, password, database };
  }

  async getJWTSecret() {
    return await this.getSecret("jwt-secret");
  }

  async getSecret(secretName) {
    try {
      const secret = await this.secretClient.getSecret(secretName);
      return secret.value;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw error;
    }
  }
}

module.exports = new SecurityService();
```

**Application Security Middleware**

```javascript
// middleware/securityMiddleware.js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const securityMiddleware = {
  // Helmet for security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://*.azure.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // CORS configuration
  cors: cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),

  // Rate limiting
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === "/health";
    },
  }),

  // Authentication rate limiting
  authRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
      error: "Too many login attempts, please try again later.",
    },
    skipSuccessfulRequests: true,
  }),
};

module.exports = securityMiddleware;
```

**Azure Active Directory Integration**

```javascript
// auth/azureAdAuth.js
const { ConfidentialClientApplication } = require("@azure/msal-node");
const jwt = require("jsonwebtoken");

class AzureADAuthService {
  constructor() {
    this.msalConfig = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) return;
            console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: "Info",
        },
      },
    };

    this.msalInstance = new ConfidentialClientApplication(this.msalConfig);
  }

  async authenticateUser(authorizationCode, redirectUri) {
    try {
      const tokenRequest = {
        code: authorizationCode,
        scopes: ["user.read"],
        redirectUri: redirectUri,
      };

      const response = await this.msalInstance.acquireTokenByCode(tokenRequest);

      // Extract user information
      const userInfo = {
        id: response.account.homeAccountId,
        email: response.account.username,
        name: response.account.name,
        roles: this.extractRoles(response.accessToken),
      };

      // Generate JWT for our application
      const jwtSecret = await securityService.getJWTSecret();
      const token = jwt.sign(userInfo, jwtSecret, { expiresIn: "24h" });

      return { token, userInfo };
    } catch (error) {
      console.error("Azure AD authentication failed:", error);
      throw error;
    }
  }

  extractRoles(accessToken) {
    // Parse JWT token to extract roles
    const decoded = jwt.decode(accessToken);
    return decoded?.roles || [];
  }

  async validateToken(token) {
    try {
      const jwtSecret = await securityService.getJWTSecret();
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

module.exports = new AzureADAuthService();
```

**Azure Security Center Integration**

```javascript
// security/securityMonitoring.js
class SecurityMonitoringService {
  constructor() {
    this.suspiciousActivities = [];
  }

  trackLoginAttempt(userId, success, ipAddress, userAgent) {
    const attempt = {
      userId,
      success,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    if (!success) {
      this.suspiciousActivities.push(attempt);
      this.checkForBruteForce(ipAddress);
    }

    // Log to Azure Security Center
    console.log("Login attempt tracked:", attempt);
  }

  checkForBruteForce(ipAddress) {
    const recentAttempts = this.suspiciousActivities.filter(
      (activity) =>
        activity.ipAddress === ipAddress &&
        !activity.success &&
        new Date(activity.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    if (recentAttempts.length >= 5) {
      this.alertSecurityTeam("Potential brute force attack", {
        ipAddress,
        attempts: recentAttempts.length,
        timeWindow: "15 minutes",
      });
    }
  }

  alertSecurityTeam(alertType, details) {
    // Send alert to security team
    console.log(`SECURITY ALERT: ${alertType}`, details);

    // Could integrate with Azure Security Center API here
  }
}

module.exports = new SecurityMonitoringService();
```

This security implementation provides:

1. **Secret management** - Azure Key Vault for sensitive data
2. **Authentication** - Azure AD integration
3. **Authorization** - Role-based access control
4. **Rate limiting** - Prevent abuse
5. **Security headers** - Helmet middleware
6. **CORS protection** - Controlled cross-origin access
7. **Security monitoring** - Track suspicious activities
8. **HTTPS enforcement** - Secure communication"

### Q4: "How would you implement auto-scaling for an Azure App Service?"

**Answer:**
"For a mission-critical system that needs to handle varying loads, I'd implement comprehensive auto-scaling:

**Azure App Service Auto-scaling Configuration**

```json
{
  "location": "East US",
  "properties": {
    "name": "sis2-webapp",
    "resourceGroup": "sis2-resources",
    "targetResourceUri": "/subscriptions/{subscription-id}/resourceGroups/sis2-resources/providers/Microsoft.Web/serverfarms/sis2-plan",
    "enabled": true,
    "profiles": [
      {
        "name": "Default",
        "capacity": {
          "minimum": 2,
          "maximum": 10,
          "default": 3
        },
        "rules": [
          {
            "metricTrigger": {
              "metricName": "CpuPercentage",
              "metricResourceUri": "/subscriptions/{subscription-id}/resourceGroups/sis2-resources/providers/Microsoft.Web/serverfarms/sis2-plan",
              "timeGrain": "PT1M",
              "statistic": "Average",
              "timeWindow": "PT10M",
              "timeAggregation": "Average",
              "operator": "GreaterThan",
              "threshold": 70
            },
            "scaleAction": {
              "direction": "Increase",
              "type": "ChangeCount",
              "value": 1,
              "cooldown": "PT5M"
            }
          },
          {
            "metricTrigger": {
              "metricName": "CpuPercentage",
              "metricResourceUri": "/subscriptions/{subscription-id}/resourceGroups/sis2-resources/providers/Microsoft.Web/serverfarms/sis2-plan",
              "timeGrain": "PT1M",
              "statistic": "Average",
              "timeWindow": "PT10M",
              "timeAggregation": "Average",
              "operator": "LessThan",
              "threshold": 30
            },
            "scaleAction": {
              "direction": "Decrease",
              "type": "ChangeCount",
              "value": 1,
              "cooldown": "PT5M"
            }
          }
        ]
      }
    ]
  }
}
```

**Custom Metrics for Business Logic**

```javascript
// monitoring/customMetrics.js
class CustomScalingMetrics {
  constructor(appInsightsClient) {
    this.client = appInsightsClient;
  }

  // Track equipment service load
  trackEquipmentServiceLoad(activeServices) {
    this.client.trackMetric({
      name: "Active Equipment Services",
      value: activeServices,
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Track concurrent users
  trackConcurrentUsers(userCount) {
    this.client.trackMetric({
      name: "Concurrent Users",
      value: userCount,
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Track API response times
  trackApiResponseTime(endpoint, responseTime) {
    this.client.trackMetric({
      name: "API Response Time",
      value: responseTime,
      properties: {
        endpoint,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Track database connection pool usage
  trackDatabaseConnections(activeConnections, maxConnections) {
    const utilizationPercentage = (activeConnections / maxConnections) * 100;

    this.client.trackMetric({
      name: "Database Connection Utilization",
      value: utilizationPercentage,
      properties: {
        activeConnections: activeConnections.toString(),
        maxConnections: maxConnections.toString(),
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Application-level scaling logic
class ApplicationScalingService {
  constructor() {
    this.currentLoad = 0;
    this.maxLoadPerInstance = 100;
  }

  // Monitor application load
  monitorLoad() {
    setInterval(() => {
      const currentMetrics = this.calculateCurrentLoad();
      this.currentLoad = currentMetrics;

      // Send metrics to Application Insights
      customMetrics.trackEquipmentServiceLoad(currentMetrics.activeServices);
      customMetrics.trackConcurrentUsers(currentMetrics.concurrentUsers);

      // Check if scaling is needed
      this.checkScalingNeeds();
    }, 60000); // Check every minute
  }

  calculateCurrentLoad() {
    // Calculate based on:
    // - Active service requests
    // - Concurrent users
    // - Database connections
    // - Memory usage

    return {
      activeServices: this.getActiveServiceCount(),
      concurrentUsers: this.getConcurrentUserCount(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  checkScalingNeeds() {
    const instancesNeeded = Math.ceil(
      this.currentLoad.activeServices / this.maxLoadPerInstance
    );
    const currentInstances = this.getCurrentInstanceCount();

    if (instancesNeeded > currentInstances) {
      console.log(
        `Scaling up needed: ${instancesNeeded} instances required, currently ${currentInstances}`
      );
    } else if (instancesNeeded < currentInstances && currentInstances > 2) {
      console.log(
        `Scaling down possible: ${instancesNeeded} instances needed, currently ${currentInstances}`
      );
    }
  }
}

module.exports = { CustomScalingMetrics, ApplicationScalingService };
```

**Load Testing for Scaling Validation**

```javascript
// testing/loadTest.js
const autocannon = require("autocannon");

class LoadTestService {
  async runLoadTest() {
    const testConfig = {
      url: "https://sis2-webapp.azurewebsites.net",
      connections: 100, // Number of concurrent connections
      duration: 300, // Test duration in seconds
      requests: [
        {
          method: "GET",
          path: "/api/equipment",
        },
        {
          method: "POST",
          path: "/api/service-records",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            equipmentId: 1,
            serviceDate: new Date().toISOString(),
            technicianId: 1,
            serviceType: "Routine",
            description: "Load test service record",
          }),
        },
      ],
    };

    try {
      const result = await autocannon(testConfig);
      console.log("Load test completed:", result);

      // Analyze results
      this.analyzeLoadTestResults(result);
    } catch (error) {
      console.error("Load test failed:", error);
    }
  }

  analyzeLoadTestResults(results) {
    const avgResponseTime = results.latency.average;
    const maxResponseTime = results.latency.max;
    const requestsPerSecond = results.requests.average;
    const errorRate = (results.errors / results.requests.total) * 100;

    console.log("Load Test Analysis:");
    console.log(`Average Response Time: ${avgResponseTime}ms`);
    console.log(`Max Response Time: ${maxResponseTime}ms`);
    console.log(`Requests per Second: ${requestsPerSecond}`);
    console.log(`Error Rate: ${errorRate}%`);

    // Determine if scaling configuration is adequate
    if (avgResponseTime > 2000) {
      console.log("⚠️ High response times detected - consider scaling up");
    }

    if (errorRate > 5) {
      console.log("⚠️ High error rate detected - check scaling configuration");
    }

    if (requestsPerSecond < 50) {
      console.log("⚠️ Low throughput - may need more instances");
    }
  }
}

module.exports = new LoadTestService();
```

This auto-scaling implementation provides:

1. **CPU-based scaling** - Scale based on CPU utilization
2. **Custom metrics** - Business logic-driven scaling
3. **Load balancing** - Distribute traffic across instances
4. **Performance monitoring** - Track scaling effectiveness
5. **Load testing** - Validate scaling behavior
6. **Cost optimization** - Scale down during low usage"

---

## 🏆 Key Takeaways for Your Interview

1. **Master Azure Services** - App Service, Key Vault, Storage, Application Insights
2. **Understand DevOps** - CI/CD pipelines, automated deployment
3. **Learn Security** - Authentication, authorization, secret management
4. **Know Monitoring** - Application Insights, Log Analytics, alerts
5. **Practice Scaling** - Auto-scaling, load balancing, performance optimization
6. **Understand Cost Management** - Resource optimization, monitoring costs

## 🎯 Practice Exercises

1. Deploy a Node.js app to Azure App Service
2. Set up monitoring with Application Insights
3. Implement Azure Key Vault for secrets management
4. Configure auto-scaling rules and test them

Remember: Azure Cloud is about building scalable, secure, and reliable applications in the cloud! 🚀
