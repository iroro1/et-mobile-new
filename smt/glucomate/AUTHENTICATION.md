# GlucoMate Authentication System

## Overview

GlucoMate implements a secure, multi-layered authentication system using biometric authentication (Face ID/Touch ID) and PIN-based authentication with secure storage.

## Authentication Flow

### First Launch (Setup Flow)

1. **Initial Setup Detection**
   - App checks if PIN exists using `hasCompletedSetup()`
   - If no PIN found, user enters setup mode

2. **PIN Creation**
   - User creates a 4-digit PIN
   - PIN is confirmed by re-entering
   - PIN is securely stored using `expo-secure-store`

3. **Biometric Enrollment (Optional)**
   - After PIN setup, app checks for biometric availability
   - If available, user is prompted to enable biometric auth
   - Preference is stored securely

### Subsequent Launches (Authentication Flow)

1. **Biometric Authentication (Primary)**
   - If biometric is enabled and available
   - User is prompted for Face ID/Touch ID
   - On success → App unlocked
   - On failure → Falls back to PIN

2. **PIN Authentication (Fallback)**
   - If biometric fails or is unavailable
   - User enters 4-digit PIN
   - PIN is validated against stored PIN
   - On success → App unlocked
   - On failure → Error shown, user can retry

## Architecture

### Utility Functions (`src/utils/biometrics.ts`)

#### `checkBiometricSupport(): Promise<BiometricSupportResult>`
Returns comprehensive biometric support information:
- `isAvailable`: Boolean indicating if biometric auth can be used
- `hasHardware`: Device has biometric hardware
- `isEnrolled`: User has enrolled biometrics
- `supportedTypes`: Array of supported types (1=FaceID, 2=Fingerprint)

#### `authenticateUser(): Promise<boolean>`
Attempts biometric authentication:
- Checks availability first
- Shows native biometric prompt
- Returns success/failure status

#### `getStoredPIN(): Promise<string | null>`
Retrieves PIN from secure storage:
- Returns PIN string if exists
- Returns null if no PIN stored

#### `savePIN(pin: string): Promise<boolean>`
Saves PIN to secure storage:
- Validates PIN format (4 digits)
- Stores securely using expo-secure-store
- Returns success status

#### `validatePIN(input: string): Promise<boolean>`
Validates entered PIN:
- Compares input with stored PIN
- Returns match status

#### `hasCompletedSetup(): Promise<boolean>`
Checks if initial setup is complete:
- Returns true if PIN exists
- Returns false if setup needed

#### `clearAuthData(): Promise<void>`
Clears all authentication data:
- Removes stored PIN
- Removes biometric preference
- Used for logout/reset

### Components

#### `PINInput` (`src/components/PINInput.tsx`)
Reusable PIN input component with:
- Visual dot indicators (4 digits)
- Numeric keyboard input
- Error handling with shake animation
- Auto-focus and completion callbacks
- Customizable title and error messages

#### `AuthScreen` (`src/screens/AuthScreen.tsx`)
Main authentication screen with multiple modes:
- **Biometric Mode**: Shows biometric prompt with fallback
- **PIN Mode**: Shows PIN input for authentication
- **Setup Mode**: First-time PIN creation
- **Confirm Setup Mode**: PIN confirmation during setup

### Authentication Context (`src/hooks/useAuth.tsx`)

Provides app-wide authentication state:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;        // Current auth status
  isLoading: boolean;              // Loading state
  needsSetup: boolean;             // First-time setup needed
  biometricSupport: BiometricSupportResult | null;
  biometricEnabled: boolean;       // User preference
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  completeSetup: () => Promise<void>;
  checkSetupStatus: () => Promise<void>;
}
```

## Security Features

### Secure Storage
- PINs stored using `expo-secure-store`
- Hardware-backed encryption on supported devices
- Data isolated per app installation

### Biometric Authentication
- Native iOS/Android biometric APIs
- Secure Enclave/TEE integration
- No biometric data stored by app

### PIN Security
- 4-digit numeric PIN for simplicity
- Stored securely, never in plain text
- Can be reset via Settings

## User Experience

### Setup Flow
```
Launch App
    ↓
No PIN? → Setup Screen
    ↓
Enter PIN (4 digits)
    ↓
Confirm PIN
    ↓
Enable Biometric? (Optional)
    ↓
App Unlocked
```

### Login Flow (Biometric Enabled)
```
Launch App
    ↓
Biometric Prompt
    ↓
Success? → App Unlocked
    ↓
Failed? → PIN Entry
    ↓
Valid PIN? → App Unlocked
```

### Login Flow (PIN Only)
```
Launch App
    ↓
PIN Entry Screen
    ↓
Valid PIN? → App Unlocked
    ↓
Invalid? → Error + Retry
```

## Settings Integration

Users can manage authentication via Settings:
- Toggle biometric authentication on/off
- Reset PIN (requires re-authentication)
- View biometric availability status
- Clear all data (removes PIN and logs out)

## Error Handling

### Biometric Errors
- Hardware not available → Fall back to PIN
- User not enrolled → Fall back to PIN
- Authentication cancelled → Remain locked
- Authentication failed → Fall back to PIN

### PIN Errors
- Invalid PIN → Show error, allow retry
- PIN mismatch during setup → Start over
- Storage errors → Show error message

## Future Enhancements

Potential improvements:
- [ ] Biometric authentication timeout
- [ ] PIN complexity options (6-digit, alphanumeric)
- [ ] Failed attempt lockout
- [ ] PIN recovery via email
- [ ] Multiple user profiles
- [ ] App lock timeout settings
- [ ] Quick unlock with biometric only

## Testing

### Test Cases

1. **First Launch**
   - Verify setup screen appears
   - Create PIN successfully
   - Confirm PIN mismatch handling
   - Enable biometric prompt shows

2. **Biometric Authentication**
   - Successful biometric auth
   - Failed biometric auth fallback
   - Biometric not available handling
   - Cancel biometric prompt

3. **PIN Authentication**
   - Valid PIN entry
   - Invalid PIN entry
   - PIN validation errors

4. **Settings**
   - Toggle biometric on/off
   - Reset PIN flow
   - Logout functionality

## Dependencies

- `expo-local-authentication`: Biometric authentication
- `expo-secure-store`: Secure PIN storage
- `@react-native-async-storage/async-storage`: App preferences
- `react-native-reanimated`: PIN input animations

