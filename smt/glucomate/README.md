# 🩸 GlucoMate

> A comprehensive React Native mobile application for tracking and managing glucose levels with biometric security, intelligent insights, and professional reporting.

<div align="center">
  
![Version](https://img.shields.io/badge/version-1.0.0-2ec4b6)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 📖 Overview

**GlucoMate** is a feature-rich glucose tracking application built with React Native and Expo. It provides users with a secure, intuitive platform to monitor their glucose levels, visualize trends, and generate professional reports for healthcare providers.

### Why GlucoMate?

- **🔐 Privacy First**: All data stays on your device with no cloud dependency
- **🧠 Intelligent Insights**: AI-powered pattern detection and personalized recommendations
- **📊 Beautiful Visualizations**: 14-day trend charts and comprehensive statistics
- **🩺 Healthcare Ready**: Professional PDF reports for doctors
- **💾 Data Portability**: Local backup/restore with JSON export

---

## ✨ Features

### 🔒 Security & Authentication

- **Multi-layered Authentication**
  - Biometric authentication (Face ID, Touch ID, Fingerprint)
  - Secure 4-digit PIN system
  - Hardware-backed encryption with expo-secure-store
  - Automatic fallback mechanisms
- **First-Time Setup**
  - Guided PIN creation flow
  - PIN confirmation to prevent typos
  - Optional biometric enrollment
- **Flexible Security Management**
  - Change PIN with verification
  - Toggle biometric authentication
  - Secure session management

### 📊 Glucose Tracking

- **Comprehensive Reading Input**
  - Glucose level (1-600 mg/dL range with validation)
  - Reading type: Fasting, Post-meal, Random
  - Date & time selection (native pickers)
  - Optional notes (200 characters)
  - Real-time validation
- **Data Management**
  - Edit existing readings
  - Delete with confirmation
  - Filter by type and date range
  - Pull-to-refresh
  - UUID-based unique identification

### 📈 Analytics & Insights

- **Dashboard**
  - Latest glucose reading with color-coding
  - 7-day average
  - Highest/lowest readings
  - Total reading count
  - Personalized time-aware greetings
  - Quick insights with trend indicators
- **Trend Analysis**
  - Week-over-week comparisons
  - Pattern detection (fasting highs, post-meal spikes)
  - Rule-based insight generation
  - 14-day trend visualization
  - Type-specific breakdowns
- **Visual Charts**
  - Interactive line charts (Victory Native)
  - Color-coded data points
  - Target range shading (70-140 mg/dL)
  - Smooth interpolation
  - Professional legends

### 📄 Export & Sharing

- **PDF Reports**
  - Professional HTML-based reports
  - Comprehensive statistics
  - Recent 30 readings table
  - Weekly insights
  - Color-coded values
  - Medical disclaimer
  - Share via email, messaging, or files
- **JSON Backups**
  - Complete data export
  - Restore with duplicate detection
  - 100% local operations
  - Human-readable format
  - Version tracking

### ⚙️ Settings & Preferences

- **Security Settings**
  - Biometric authentication toggle
  - Change PIN functionality
  - Security status indicators
- **Data Management**
  - Generate PDF reports
  - Create JSON backups
  - Restore from backups
  - Clear all data option
- **App Information**
  - Version number
  - Device information
  - Platform details
  - Total readings count

### 🎨 User Experience

- **Beautiful UI**
  - Teal accent color (#2ec4b6)
  - Rounded cards with soft shadows
  - Large, readable typography
  - Consistent spacing and layout
- **Smooth Animations**
  - Moti screen transitions
  - Staggered list animations
  - Fade-in effects
  - Scale and slide transitions
- **Helpful Feedback**
  - Toast notifications for all actions
  - Loading states
  - Empty states with instructions
  - Confirmation dialogs
  - Color-coded health indicators

---

## 🛠️ Tech Stack

### Core Framework

- **React Native** `0.81.4` - Cross-platform mobile framework
- **Expo** `~54.0` - Development platform
- **TypeScript** `^5.9` - Type safety and developer experience

### Navigation

- **React Navigation** `^7.1` - Routing and navigation
  - Native Stack Navigator
  - Bottom Tabs Navigator
  - Type-safe navigation

### State Management & Storage

- **React Context API** - Global state management
- **AsyncStorage** `2.2.0` - Local data persistence
- **Expo Secure Store** `~15.0` - Encrypted storage for sensitive data

### UI & Animations

- **Moti** `^0.30.0` - Declarative animations
- **React Native Reanimated** `~4.1.1` - Performance animations
- **React Native Gesture Handler** `~2.28.0` - Touch interactions
- **React Native Safe Area Context** `^5.6.1` - Safe area management
- **React Native Toast Message** `^2.3.3` - Toast notifications

### Charts & Visualization

- **Victory Native** `^41.20.1` - Data visualization and charts

### Authentication

- **Expo Local Authentication** `~17.0.7` - Biometric authentication
- **UUID** `^13.0.0` - Unique ID generation

### File & Document Handling

- **Expo Print** `~15.0.7` - PDF generation
- **Expo File System** `~19.0.17` - File operations
- **Expo Sharing** `~14.0.7` - Native share dialogs
- **Expo Document Picker** `~14.0.7` - File selection

### Additional Utilities

- **Expo Device** `~8.0.9` - Device information
- **Expo Application** `~7.0.7` - App metadata
- **DateTime Picker** `8.4.4` - Native date/time pickers

---

## 📸 Screenshots

_Screenshots would be added here showing:_

### Main Features

1. **Authentication Flow**

   - Welcome screen with PIN setup
   - Biometric authentication prompt
   - PIN entry screen

2. **Dashboard**

   - Personalized greeting header
   - Latest glucose reading card
   - Statistics overview
   - Quick insights card
   - Add reading button

3. **Add/Edit Reading**

   - Glucose input form
   - Type picker modal
   - Date/time selectors
   - Notes field

4. **History**

   - Filterable reading list
   - Color-coded cards
   - Edit/Delete actions
   - Filter modal

5. **Insights**

   - 14-day trend chart
   - Weekly insights
   - Detailed statistics
   - Type breakdown

6. **Settings**
   - Security options
   - Data management
   - Export/Backup options
   - App information

---

## 📚 Project Structure

```
glucomate/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FilterModal.tsx  # Reading filter interface
│   │   ├── PINInput.tsx     # PIN entry component
│   │   └── TypePicker.tsx   # Reading type selector
│   │
│   ├── constants/           # App-wide constants
│   │   └── theme.ts         # Design system (colors, spacing, etc.)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication context
│   │   └── useReadings.ts  # Glucose readings management
│   │
│   ├── navigation/         # Navigation configuration
│   │   ├── AppStack.tsx    # Authenticated user navigation
│   │   ├── AuthStack.tsx   # Authentication navigation
│   │   ├── index.tsx       # Root navigator
│   │   └── types.ts        # Navigation type definitions
│   │
│   ├── screens/            # Screen components
│   │   ├── AddReading.tsx  # Add glucose reading
│   │   ├── AuthScreen.tsx  # Authentication/Setup
│   │   ├── ChangePIN.tsx   # PIN change flow
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── EditReading.tsx # Edit existing reading
│   │   ├── History.tsx     # Reading history list
│   │   ├── Insights.tsx    # Charts and analytics
│   │   └── Settings.tsx    # App settings
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── reading.ts      # Glucose reading interfaces
│   │
│   └── utils/              # Utility functions
│       ├── backup.ts       # Backup/restore operations
│       ├── biometrics.ts   # Biometric auth utilities
│       ├── insights.ts     # Insight generation logic
│       ├── pdfExport.ts    # PDF report generation
│       ├── storage.ts      # AsyncStorage operations
│       └── userProfile.ts  # User personalization
│
├── assets/                 # App assets
│   ├── icon.png           # App icon
│   ├── splash-icon.png    # Splash screen
│   └── adaptive-icon.png  # Android adaptive icon
│
├── App.tsx                # App entry point
├── app.json               # Expo configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.19.0 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Studio
- Physical device with Expo Go (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd glucomate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your platform**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web browser
   ```

### Development Build (For Native Features)

For features like biometric authentication that require native modules:

```bash
# Generate native projects
npx expo prebuild --clean

# Run development build
npx expo run:android
npx expo run:ios
```

---

## 💡 How It Works

### First Launch

1. **Setup Flow**
   - Create a 4-digit PIN
   - Confirm your PIN
   - Optionally enable biometric authentication
   - Access the app

### Daily Use

1. **Authentication**

   - Biometric prompt (if enabled) or PIN entry
   - Automatic fallback to PIN if biometric fails

2. **Track Glucose**

   - Tap "Add New Reading"
   - Enter glucose value
   - Select type (Fasting/Post-meal/Random)
   - Add optional notes
   - Save

3. **View Insights**

   - Dashboard shows latest reading and statistics
   - History displays all readings with filters
   - Insights shows trends and charts
   - Get personalized recommendations

4. **Export Data**
   - Generate PDF reports for doctors
   - Create JSON backups for safety
   - Restore from previous backups

---

## 🎯 Key Features Explained

### Intelligent Insights

The app analyzes your glucose patterns and provides:

**Week-over-Week Comparisons**

```
This week: 98 mg/dL average
Last week: 115 mg/dL average
→ "Great job — readings improved this week!"
```

**Pattern Detection**

- High fasting readings (≥3 in a week)
- Post-meal spikes (≥3 above 160 mg/dL)
- Low glucose alerts (≥2 below 70 mg/dL)
- Consistency recognition

**Trend Indicators**

- 📈 Trending up
- 📉 Trending down
- ➡️ Stable

### Color Coding System

**Glucose Levels:**

- 🟢 **Normal** (70-140 mg/dL) - Green
- 🟠 **Low** (<70 mg/dL) - Orange
- 🔴 **High** (>140 mg/dL) - Red

**Reading Types:**

- 🌅 **Fasting** - Purple badge
- 🍽️ **Post-meal** - Orange badge
- ⏰ **Random** - Blue badge

---

## 📱 Platform Support

### iOS

- ✅ iOS 13.0+
- ✅ Face ID support
- ✅ Touch ID support
- ✅ iPad compatible
- ✅ Native date/time pickers
- ✅ Smooth animations

### Android

- ✅ Android 6.0+ (API 23)
- ✅ Fingerprint authentication
- ✅ Face unlock support
- ✅ Material Design components
- ✅ Edge-to-edge display
- ✅ Adaptive icons

### Web

- ✅ Responsive design
- ✅ PWA capabilities
- ✅ Theme color support

---

## 🔐 Security & Privacy

### Data Protection

- **Secure Storage**: PINs encrypted with hardware-backed storage
- **Biometric Integration**: Native iOS/Android biometric APIs
- **Local First**: All data stays on device by default
- **No Tracking**: No analytics, no third-party data collection
- **User Control**: Complete control over data export and sharing

### Authentication Layers

1. App-level: PIN or biometric
2. Storage-level: expo-secure-store encryption
3. Device-level: OS-level security

---

## 📊 Data Management

### Storage Strategy

- **AsyncStorage**: Glucose readings and preferences
- **Expo Secure Store**: Authentication credentials (PIN)
- **File System**: Exports (PDF, JSON backups)

### Backup & Restore

- Export all data as JSON
- Restore with duplicate detection
- No data loss during restore
- Version tracking in backups

---

## 🎨 Design System

### Color Palette

- **Primary**: #2ec4b6 (Teal) - Main accent color
- **Success**: #4CAF50 (Green) - Normal glucose, positive actions
- **Warning**: #FF9800 (Orange) - Low glucose, warnings
- **Error**: #F44336 (Red) - High glucose, errors
- **Info**: #2196F3 (Blue) - Information, neutral

### Typography

- **Headings**: Bold, 28-42px
- **Body**: Medium, 14-16px
- **Labels**: 12-14px
- **Display**: Large glucose values at 56px

### Component Style

- Rounded corners (12-16px radius)
- Soft shadows for depth
- Consistent spacing (4-32px scale)
- Touch-friendly buttons (minimum 44pt)

---

## 🧪 Technologies Deep Dive

### Why These Technologies?

**React Native + Expo**

- Cross-platform development (iOS & Android from one codebase)
- Hot reload for fast development
- Managed workflow with Expo
- Easy access to native features

**TypeScript**

- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

**Moti**

- Declarative animations
- 60fps performance
- Easy to use and maintain
- Beautiful transitions

**Victory Native**

- Powerful charting library
- Customizable and responsive
- React Native optimized
- Professional visualizations

**Expo Secure Store**

- Hardware-backed encryption
- Secure Enclave (iOS) / Keystore (Android)
- Perfect for sensitive data (PINs)

---

## 📈 Performance Optimizations

### Implemented Optimizations

1. **Memoization**

   - `useMemo` for filtered data
   - `useCallback` for stable function references
   - Prevents unnecessary re-renders

2. **Lazy Loading**

   - Data loaded on screen focus
   - Pull-to-refresh for manual updates
   - Efficient list rendering

3. **List Performance**

   - `FlatList` with `keyExtractor`
   - Optimized `renderItem`
   - Windowing for long lists

4. **Image Optimization**

   - Compressed assets
   - Appropriate resolutions
   - Lazy loading

5. **Bundle Optimization**
   - Tree shaking enabled
   - Code splitting via navigation
   - Minimized bundle size

---

## 🎓 Lessons Learned

### Technical Lessons

1. **TypeScript is Essential**

   - Caught numerous bugs before runtime
   - Made refactoring safe and easy
   - Improved code documentation
   - Better team collaboration potential

2. **Authentication is Complex**

   - Multiple fallback layers needed
   - User experience must be smooth
   - Error handling is critical
   - Biometric availability varies by device

3. **Data Persistence Matters**

   - AsyncStorage is simple but powerful
   - Validation on read/write is crucial
   - Backup/restore adds user confidence
   - Migration strategy needed for updates

4. **React Version Conflicts are Real**
   - Multiple React versions cause hook errors
   - Package overrides can solve this
   - Always check dependency trees
   - Cache clearing sometimes necessary

### UX/UI Lessons

1. **Consistency Builds Trust**

   - Design system prevents style drift
   - Centralized constants make updates easy
   - Users notice consistent patterns
   - Professional feel comes from details

2. **Animations Enhance Perceived Performance**

   - Smooth transitions feel faster
   - Staggered animations guide attention
   - Loading states reduce anxiety
   - Too much animation is distracting

3. **Feedback is Everything**

   - Toast notifications > Alert dialogs
   - Users need to know actions succeeded
   - Error messages should be helpful
   - Empty states guide next actions

4. **Accessibility from Day One**
   - Large touch targets (44pt+)
   - High contrast for readability
   - Clear labels and instructions
   - Color + text for status (not color alone)

### Health App Specific Lessons

1. **Users Need Reassurance**

   - Medical disclaimer is important
   - Clear data ownership messaging
   - Privacy-first approach appreciated
   - Professional reports build confidence

2. **Simplicity Wins**

   - 4-digit PIN > complex passwords
   - 3 reading types > many categories
   - Quick add > complex forms
   - Visual feedback > numbers

3. **Patterns Matter**
   - Weekly comparisons are actionable
   - Trend detection provides value
   - Type-specific insights help
   - Consistent tracking is key

---

## 🚀 Deployment

### Building for Production

#### Android (APK/AAB)

```bash
# Generate production build
eas build --platform android --profile production

# Or local build
npx expo run:android --variant release
```

#### iOS (IPA)

```bash
# Generate production build
eas build --platform ios --profile production

# Or local build
npx expo run:ios --configuration Release
```

### App Store Requirements

- App icon (1024x1024)
- Screenshots for all device sizes
- Privacy policy
- App description
- Keywords for ASO

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**

- [ ] First-time PIN setup
- [ ] Biometric authentication
- [ ] PIN fallback
- [ ] Change PIN
- [ ] Logout/login

**Data Entry**

- [ ] Add reading with all fields
- [ ] Edit existing reading
- [ ] Delete reading
- [ ] Form validation

**Filtering & Search**

- [ ] Filter by type
- [ ] Filter by date range
- [ ] Multiple filters
- [ ] Clear filters

**Export & Backup**

- [ ] Generate PDF
- [ ] Create JSON backup
- [ ] Restore from backup
- [ ] Share files

**Settings**

- [ ] Toggle biometric
- [ ] Change PIN
- [ ] Clear data
- [ ] View app info

---

## 📝 API Reference

### Storage Functions

```typescript
// Get all readings
const readings = await getReadings();

// Save new reading
const reading = await saveReading(value, type, timestamp, notes);

// Update reading
await updateReading(id, { value: 100 });

// Delete reading
await deleteReading(id);

// Clear all
await clearAllReadings();
```

### Authentication Functions

```typescript
// Check biometric support
const support = await checkBiometricSupport();

// Authenticate
const success = await authenticateUser();

// PIN operations
await savePIN(pin);
const isValid = await validatePIN(input);
```

### Backup Functions

```typescript
// Create backup
await createBackup(); // Opens share dialog

// Restore from backup
const result = await restoreFromBackup(); // Opens file picker
console.log(`Imported ${result.count} new readings`);
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write clean, typed code
4. Add appropriate comments
5. Test on both platforms
6. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

Built with ❤️ as a comprehensive glucose tracking solution

---

## 🙏 Acknowledgments

- **Expo Team** - For amazing development tools
- **React Native Community** - For libraries and support
- **Victory** - For beautiful charts
- **Healthcare Professionals** - For insights on glucose management

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

## 🎯 Version History

### v1.0.0 (Current)

- ✅ Complete glucose tracking system
- ✅ Biometric + PIN authentication
- ✅ Trend insights with charts
- ✅ PDF reports and JSON backups
- ✅ Polished UI with teal theme
- ✅ Local-first data management

---

<div align="center">

**GlucoMate** - Your glucose tracking companion 🩸📊💙

_Helping people manage their health, one reading at a time._

</div>
