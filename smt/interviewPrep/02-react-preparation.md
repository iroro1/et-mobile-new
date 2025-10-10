# React Preparation Module - Explained Like You're 5! ⚛️

## What is React? 🤔

Think of React like building a puzzle! Each piece of the puzzle is a "component" that fits together to make a complete picture (your web application). React is like having a magic box that automatically updates the puzzle pieces when the picture needs to change.

## Why React for Caterpillar SIS 2.0? 🏗️

Caterpillar uses React as their **secondary frontend framework** alongside Vue.js. You'll use React for specific parts of the SIS 2.0 system, especially for complex interactive components and mobile applications.

---

## 🧩 React Fundamentals (The Puzzle Pieces)

### 1. Components (Your Puzzle Pieces)

A component is a reusable piece of your application.

```jsx
// EquipmentCard.jsx
import React from "react";

const EquipmentCard = ({ equipment, onStatusChange }) => {
  return (
    <div className="equipment-card">
      <h3>{equipment.name}</h3>
      <p>
        Status:{" "}
        <span className={equipment.status.toLowerCase()}>
          {equipment.status}
        </span>
      </p>
      <p>Location: {equipment.location}</p>
      <button onClick={() => onStatusChange(equipment.id)}>
        Update Status
      </button>
    </div>
  );
};

export default EquipmentCard;
```

### 2. Hooks (The Magic Tools)

Hooks are like special tools that give your components superpowers!

```jsx
// ServiceDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";

const ServiceDashboard = () => {
  // useState - Like a sticky note that remembers values
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect - Runs when something changes (like a watcher)
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/equipment");
        const data = await response.json();
        setEquipment(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []); // Empty array means run once when component mounts

  // useMemo - Like a calculator that only recalculates when needed
  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipment, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading equipment data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Service Dashboard</h1>

      <input
        type="text"
        placeholder="Search equipment..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <div className="equipment-grid">
        {filteredEquipment.map((eq) => (
          <EquipmentCard
            key={eq.id}
            equipment={eq}
            onStatusChange={(id) => console.log("Status changed for:", id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceDashboard;
```

### 3. Custom Hooks (Your Own Magic Tools)

Create your own reusable logic!

```jsx
// hooks/useServiceData.js
import { useState, useEffect } from "react";

const useServiceData = (equipmentId) => {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServiceData = async () => {
    if (!equipmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/service/${equipmentId}`);
      if (!response.ok) throw new Error("Failed to fetch service data");

      const data = await response.json();
      setServiceData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [equipmentId]);

  const refetch = () => {
    fetchServiceData();
  };

  return {
    serviceData,
    loading,
    error,
    refetch,
  };
};

export default useServiceData;

// Using the custom hook
const ServiceDetails = ({ equipmentId }) => {
  const { serviceData, loading, error, refetch } = useServiceData(equipmentId);

  if (loading) return <div>Loading service details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!serviceData) return <div>No service data available</div>;

  return (
    <div className="service-details">
      <h3>Service Details</h3>
      <p>Last Service: {serviceData.lastServiceDate}</p>
      <p>Next Service Due: {serviceData.nextServiceDate}</p>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
```

### 4. Context API (Sharing Data Between Components)

Like a shared notebook that all components can read and write in!

```jsx
// context/ServiceContext.js
import React, { createContext, useContext, useReducer } from "react";

const ServiceContext = createContext();

// Action types
const ACTIONS = {
  SET_EQUIPMENT: "SET_EQUIPMENT",
  ADD_SERVICE_RECORD: "ADD_SERVICE_RECORD",
  UPDATE_EQUIPMENT_STATUS: "UPDATE_EQUIPMENT_STATUS",
};

// Reducer - like a recipe for updating state
const serviceReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_EQUIPMENT:
      return { ...state, equipment: action.payload };

    case ACTIONS.ADD_SERVICE_RECORD:
      return {
        ...state,
        serviceRecords: [...state.serviceRecords, action.payload],
      };

    case ACTIONS.UPDATE_EQUIPMENT_STATUS:
      return {
        ...state,
        equipment: state.equipment.map((eq) =>
          eq.id === action.payload.id
            ? { ...eq, status: action.payload.status }
            : eq
        ),
      };

    default:
      return state;
  }
};

// Provider component
export const ServiceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serviceReducer, {
    equipment: [],
    serviceRecords: [],
    loading: false,
  });

  const value = {
    ...state,
    dispatch,
  };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

// Custom hook to use the context
export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};

// Using the context
const EquipmentList = () => {
  const { equipment, dispatch } = useService();

  const updateStatus = (id, newStatus) => {
    dispatch({
      type: ACTIONS.UPDATE_EQUIPMENT_STATUS,
      payload: { id, status: newStatus },
    });
  };

  return (
    <div>
      {equipment.map((eq) => (
        <div key={eq.id}>
          <h3>{eq.name}</h3>
          <p>Status: {eq.status}</p>
          <button onClick={() => updateStatus(eq.id, "Maintenance")}>
            Mark for Maintenance
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "Explain the difference between props and state in React."

**Answer:**
"Great question! Think of props and state like different types of information:

**Props** are like instructions that come from outside the component:

```jsx
// Parent component passes data down
<EquipmentCard equipment={equipmentData} onUpdate={handleUpdate} />;

// Child component receives props
const EquipmentCard = ({ equipment, onUpdate }) => {
  return <div>{equipment.name}</div>;
};
```

**State** is like the component's own personal memory:

```jsx
const ServiceForm = () => {
  const [formData, setFormData] = useState({
    equipmentId: "",
    serviceDate: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form>
      <input
        name="equipmentId"
        value={formData.equipmentId}
        onChange={handleChange}
      />
    </form>
  );
};
```

**Key differences:**

- Props are read-only and come from parent components
- State can be changed by the component itself
- Props flow down, state stays within the component"

### Q2: "How would you handle error boundaries in React for a mission-critical application?"

**Answer:**
"Error boundaries are like safety nets that catch errors and prevent the entire app from crashing. For a mission-critical system like SIS 2.0, this is crucial:

```jsx
// ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);

    // Send to error tracking service
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        extra: errorInfo,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the service system.</h2>
          <p>Our team has been notified and is working to fix this.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
          <details>
            <summary>Error Details (for developers)</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Using the error boundary
const App = () => {
  return (
    <ErrorBoundary>
      <ServiceDashboard />
      <EquipmentList />
      <ServiceRecords />
    </ErrorBoundary>
  );
};
```

This ensures that if one component fails, the rest of the application continues to work."

### Q3: "How would you optimize a React component that renders a large list of service records?"

**Answer:**
"For large lists in a mission-critical system, I'd implement several optimization strategies:

```jsx
// OptimizedServiceRecords.jsx
import React, { useState, useMemo, useCallback, memo } from "react";

// Memoized list item component
const ServiceRecordItem = memo(({ record, onUpdate }) => {
  const handleStatusChange = useCallback(
    (newStatus) => {
      onUpdate(record.id, newStatus);
    },
    [record.id, onUpdate]
  );

  return (
    <div className="service-record-item">
      <h4>{record.equipmentName}</h4>
      <p>Service Date: {record.serviceDate}</p>
      <p>Technician: {record.technician}</p>
      <select
        value={record.status}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
});

const ServiceRecords = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Debounced search to avoid excessive filtering
  const filteredRecords = useMemo(() => {
    let filtered = records.filter((record) =>
      record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort records
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.serviceDate) - new Date(a.serviceDate);
        case "status":
          return a.status.localeCompare(b.status);
        case "equipment":
          return a.equipmentName.localeCompare(b.equipmentName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [records, searchTerm, sortBy]);

  // Memoized callback to prevent unnecessary re-renders
  const handleRecordUpdate = useCallback((id, newStatus) => {
    // Update logic here
    console.log(`Updating record ${id} to ${newStatus}`);
  }, []);

  return (
    <div className="service-records">
      <div className="controls">
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="equipment">Sort by Equipment</option>
        </select>
      </div>

      <div className="records-list">
        {filteredRecords.map((record) => (
          <ServiceRecordItem
            key={record.id}
            record={record}
            onUpdate={handleRecordUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceRecords;
```

Key optimizations:

1. **React.memo** - Prevents unnecessary re-renders
2. **useMemo** - Caches expensive calculations
3. **useCallback** - Prevents function recreation
4. **Debounced search** - Reduces filtering operations
5. **Virtual scrolling** (with react-window) for very large lists"

### Q4: "How would you handle authentication and authorization in a React application for service technicians?"

**Answer:**
"I'd implement a comprehensive auth system using React Context and protected routes:

```jsx
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token invalid, clear it
          localStorage.removeItem("authToken");
          setToken(null);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("authToken");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem("authToken", token);
        setToken(token);
        setUser(user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Protected Route component
const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { user, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div>Access denied. You don't have permission to view this page.</div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <div>Access denied. You don't have the required role.</div>;
  }

  return children;
};

// Usage in App.js
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ServiceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment"
            element={
              <ProtectedRoute requiredPermission="equipment.view">
                <EquipmentList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
```

This system ensures secure access control for different user roles and permissions."

---

## 🏆 Key Takeaways for Your Interview

1. **Master React Hooks** - useState, useEffect, useMemo, useCallback
2. **Understand Component Lifecycle** - When components mount, update, and unmount
3. **Learn State Management** - Context API, Redux, or Zustand
4. **Practice Error Handling** - Error boundaries and graceful degradation
5. **Know Performance Optimization** - Memoization, virtual scrolling, code splitting
6. **Understand Authentication** - Protected routes and user management

## 🎯 Practice Exercises

1. Build a service technician dashboard with real-time updates
2. Create a form with validation and error handling
3. Implement a search and filter system for equipment
4. Build a component that handles authentication states

Remember: React is all about building reusable, performant components that create amazing user experiences! 🚀
