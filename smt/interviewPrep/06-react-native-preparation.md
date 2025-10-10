# React Native Preparation Module - Explained Like You're 5! 📱

## What is React Native? 🤔

Think of React Native like a magic translator! It takes your React code and translates it into native mobile apps for both iPhone and Android. It's like having one recipe that can make both apple pie and pumpkin pie - same ingredients, different results!

## Why React Native for Caterpillar SIS 2.0? 🏗️

Caterpillar uses React Native for their mobile app that field technicians use. This means technicians can access service information, update equipment status, and view documentation right from their phones or tablets while working on equipment.

---

## 📱 React Native Fundamentals

### 1. Basic Components

```jsx
// EquipmentCard.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EquipmentCard = ({ equipment, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(equipment)}>
      <Text style={styles.title}>{equipment.name}</Text>
      <Text style={styles.status}>Status: {equipment.status}</Text>
      <Text style={styles.location}>Location: {equipment.location}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default EquipmentCard;
```

### 2. Navigation

```jsx
// App.jsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EquipmentList">
        <Stack.Screen
          name="EquipmentList"
          component={EquipmentListScreen}
          options={{ title: "Equipment List" }}
        />
        <Stack.Screen
          name="EquipmentDetails"
          component={EquipmentDetailsScreen}
          options={{ title: "Equipment Details" }}
        />
        <Stack.Screen
          name="ServiceRecord"
          component={ServiceRecordScreen}
          options={{ title: "New Service Record" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 3. API Integration

```jsx
// services/apiService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiService {
  constructor() {
    this.baseURL = "https://sis2-api.azurewebsites.net/api";
  }

  async getAuthToken() {
    return await AsyncStorage.getItem("authToken");
  }

  async fetchEquipment() {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch equipment");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async createServiceRecord(recordData) {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseURL}/service-records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) throw new Error("Failed to create service record");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}

export default new ApiService();
```

---

## 🎯 Mock Interview Questions & Answers

### Q1: "How would you handle offline functionality in a React Native app for field technicians?"

**Answer:**
"For field technicians who often work in areas with poor connectivity, offline functionality is crucial:

```jsx
// services/offlineService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-netinfo/netinfo";

class OfflineService {
  async syncData() {
    const isConnected = await NetInfo.fetch().then(
      (state) => state.isConnected
    );

    if (isConnected) {
      await this.uploadPendingRecords();
      await this.downloadLatestData();
    }
  }

  async saveOfflineRecord(record) {
    const pendingRecords = await this.getPendingRecords();
    pendingRecords.push({
      ...record,
      id: `offline_${Date.now()}`,
      isOffline: true,
      timestamp: new Date().toISOString(),
    });

    await AsyncStorage.setItem(
      "pendingRecords",
      JSON.stringify(pendingRecords)
    );
  }

  async getPendingRecords() {
    const records = await AsyncStorage.getItem("pendingRecords");
    return records ? JSON.parse(records) : [];
  }

  async uploadPendingRecords() {
    const pendingRecords = await this.getPendingRecords();

    for (const record of pendingRecords) {
      try {
        await ApiService.createServiceRecord(record);
        await this.removePendingRecord(record.id);
      } catch (error) {
        console.error("Failed to upload offline record:", error);
      }
    }
  }
}

// Usage in component
const ServiceRecordScreen = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (recordData) => {
    if (isOnline) {
      await ApiService.createServiceRecord(recordData);
    } else {
      await OfflineService.saveOfflineRecord(recordData);
      Alert.alert(
        "Saved Offline",
        "Record will be synced when connection is restored"
      );
    }
  };

  return (
    <View>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text>Working Offline - Changes will sync when connected</Text>
        </View>
      )}
      {/* Rest of component */}
    </View>
  );
};
```

This approach ensures technicians can continue working even without internet connectivity."

### Q2: "How would you implement push notifications for equipment alerts?"

**Answer:**
"I'd use Firebase Cloud Messaging (FCM) for push notifications:

```jsx
// services/notificationService.js
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

class NotificationService {
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      await this.registerToken(token);
    }
  }

  async registerToken(token) {
    const userId = await AsyncStorage.getItem("userId");
    await fetch("/api/register-device-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });
  }

  setupNotificationHandlers() {
    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log("Received foreground message:", remoteMessage);
      // Show in-app notification
    });

    // Background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Received background message:", remoteMessage);
    });
  }
}

// Usage in App.js
const App = () => {
  useEffect(() => {
    NotificationService.requestPermission();
    NotificationService.setupNotificationHandlers();
  }, []);

  return <NavigationContainer>{/* App content */}</NavigationContainer>;
};
```

This keeps technicians informed of critical equipment alerts in real-time."

### Q3: "How would you handle image capture and upload for service documentation?"

**Answer:**
"I'd use react-native-image-picker for camera functionality:

```jsx
// components/ImageCapture.jsx
import ImagePicker from "react-native-image-picker";

const ImageCapture = ({ onImageSelected }) => {
  const showImagePicker = () => {
    const options = {
      title: "Select Image",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) return;

      if (response.error) {
        Alert.alert("Error", "Failed to select image");
        return;
      }

      onImageSelected({
        uri: response.uri,
        type: response.type,
        name: response.fileName || "image.jpg",
        size: response.fileSize,
      });
    });
  };

  return (
    <TouchableOpacity onPress={showImagePicker} style={styles.cameraButton}>
      <Text>📷 Take Photo</Text>
    </TouchableOpacity>
  );
};

// Usage in ServiceRecordScreen
const ServiceRecordScreen = () => {
  const [images, setImages] = useState([]);

  const handleImageSelected = (image) => {
    setImages([...images, image]);
  };

  const uploadImages = async (serviceRecordId) => {
    for (const image of images) {
      const formData = new FormData();
      formData.append("image", {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
      formData.append("serviceRecordId", serviceRecordId);

      await fetch("/api/upload-service-image", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
    }
  };

  return (
    <View>
      <ImageCapture onImageSelected={handleImageSelected} />
      {images.map((img, index) => (
        <Image key={index} source={{ uri: img.uri }} style={styles.thumbnail} />
      ))}
    </View>
  );
};
```

This allows technicians to document equipment issues with photos."

---

## 🏆 Key Takeaways

1. **Master React Native Components** - View, Text, TouchableOpacity, StyleSheet
2. **Understand Navigation** - Stack, Tab, Drawer navigation
3. **Learn API Integration** - AsyncStorage, fetch, error handling
4. **Practice Offline Functionality** - NetInfo, data synchronization
5. **Know Push Notifications** - FCM integration
6. **Understand Image Handling** - Camera, gallery, upload

## 🎯 Practice Exercises

1. Build a mobile app for equipment status updates
2. Implement offline data synchronization
3. Add push notifications for equipment alerts
4. Create image capture functionality for service records

Remember: React Native is about building native mobile experiences with web technologies! 🚀
