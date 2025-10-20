import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export interface UserProfile {
  id: string;
  name: string;
  avatarUri?: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateAvatar: (imageUri: string) => Promise<boolean>;
  clearProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = "user_profile";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (): Promise<void> => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
      } else {
        // Create default profile if none exists
        const defaultProfile: UserProfile = {
          id: "default_user",
          name: "User",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await AsyncStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify(defaultProfile)
        );
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<boolean> => {
    try {
      if (!profile) return false;

      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
      setProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  const updateAvatar = async (imageUri: string): Promise<boolean> => {
    try {
      if (!profile) return false;

      const updatedProfile: UserProfile = {
        ...profile,
        avatarUri: imageUri,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
      setProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating avatar:", error);
      return false;
    }
  };

  const clearProfile = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile(null);
    } catch (error) {
      console.error("Error clearing profile:", error);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    setIsLoading(true);
    await loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const value: ProfileContextType = {
    profile,
    isLoading,
    updateProfile,
    updateAvatar,
    clearProfile,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
