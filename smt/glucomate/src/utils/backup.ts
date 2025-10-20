import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlucoseReading } from "../types/reading";
import { getReadings } from "./storage";

const BACKUP_VERSION = "1.0";
const READINGS_KEY = "readings";

export interface BackupData {
  version: string;
  timestamp: number;
  appVersion: string;
  totalReadings: number;
  readings: GlucoseReading[];
}

/**
 * Create a backup of all glucose readings as JSON file
 */
export const createBackup = async (): Promise<boolean> => {
  try {
    // Get all readings
    const readings = await getReadings();

    if (readings.length === 0) {
      throw new Error("No readings to backup");
    }

    // Create backup object
    const backupData: BackupData = {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      appVersion: "1.0.0",
      totalReadings: readings.length,
      readings: readings,
    };

    // Convert to JSON
    const jsonString = JSON.stringify(backupData, null, 2);

    // Create filename with timestamp
    const date = new Date();
    const filename = `GlucoMate-Backup-${date.toISOString().split("T")[0]}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Save GlucoMate Backup",
        UTI: "public.json",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    return true;
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};

/**
 * Validate backup data structure
 */
const validateBackupData = (data: any): data is BackupData => {
  if (!data || typeof data !== "object") {
    return false;
  }

  if (!data.version || !data.timestamp || !Array.isArray(data.readings)) {
    return false;
  }

  // Validate each reading has required fields
  const isValid = data.readings.every((reading: any) => {
    return (
      typeof reading.id === "string" &&
      typeof reading.value === "number" &&
      typeof reading.type === "string" &&
      typeof reading.timestamp === "number" &&
      ["Fasting", "Post-meal", "Random"].includes(reading.type)
    );
  });

  return isValid;
};

/**
 * Restore readings from a backup JSON file
 */
export const restoreFromBackup = async (): Promise<{
  success: boolean;
  count: number;
}> => {
  try {
    // Let user pick a JSON file
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      throw new Error("Backup selection cancelled");
    }

    const file = result.assets[0];
    if (!file || !file.uri) {
      throw new Error("No file selected");
    }

    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse JSON
    const backupData = JSON.parse(fileContent);

    // Validate backup structure
    if (!validateBackupData(backupData)) {
      throw new Error("Invalid backup file format");
    }

    // Get existing readings
    const existingReadings = await getReadings();

    // Merge with existing readings (avoid duplicates by ID)
    const existingIds = new Set(existingReadings.map(r => r.id));
    const newReadings = backupData.readings.filter(
      (r: GlucoseReading) => !existingIds.has(r.id)
    );

    // Combine and save
    const allReadings = [...existingReadings, ...newReadings];
    await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(allReadings));

    return {
      success: true,
      count: newReadings.length,
    };
  } catch (error) {
    console.error("Error restoring from backup:", error);
    throw error;
  }
};

/**
 * Get backup file info without restoring
 */
export const getBackupInfo = async (
  fileUri: string
): Promise<{
  version: string;
  timestamp: number;
  totalReadings: number;
} | null> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const backupData = JSON.parse(fileContent);

    if (!validateBackupData(backupData)) {
      return null;
    }

    return {
      version: backupData.version,
      timestamp: backupData.timestamp,
      totalReadings: backupData.totalReadings,
    };
  } catch (error) {
    console.error("Error getting backup info:", error);
    return null;
  }
};

