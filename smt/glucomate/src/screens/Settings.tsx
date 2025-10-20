import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { useAuth } from "../hooks/useAuth";
import { useReadings } from "../hooks/useReadings";
import { clearAuthData } from "../utils/biometrics";
import { clearAllReadings } from "../utils/storage";
import { generatePDFReport, getLastExportTimestamp } from "../utils/pdfExport";
import { createBackup, restoreFromBackup } from "../utils/backup";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from "../constants/theme";

type RootStackParamList = {
  ChangePIN: undefined;
};

export default function Settings() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    biometricSupport,
    biometricEnabled,
    enableBiometric,
    disableBiometric,
    logout,
  } = useAuth();
  const { readings, refresh } = useReadings();
  const [lastExportDate, setLastExportDate] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadLastExportDate();
  }, []);

  const loadLastExportDate = async () => {
    const timestamp = await getLastExportTimestamp();
    setLastExportDate(timestamp);
  };

  const handleExportPDF = async () => {
    if (readings.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Data",
        text2: "Add some readings before exporting",
      });
      return;
    }

    setIsExporting(true);
    try {
      const success = await generatePDFReport(readings);
      if (success) {
        setLastExportDate(Date.now());
        Toast.show({
          type: "success",
          text1: "Export Successful",
          text2: "PDF report has been generated and shared",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Export Failed",
          text2: "Failed to generate PDF report",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: "An error occurred while exporting",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackup = async () => {
    if (readings.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Data",
        text2: "Add some readings before backing up",
      });
      return;
    }

    setIsBackingUp(true);
    try {
      const success = await createBackup(readings);
      if (success) {
        Toast.show({
          type: "success",
          text1: "Backup Created",
          text2: "Your data has been backed up successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Backup Failed",
          text2: "Failed to create backup",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Backup Failed",
        text2: "An error occurred while backing up",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restoreFromBackup();
      if (success) {
        await refresh();
        Toast.show({
          type: "success",
          text1: "Restore Successful",
          text2: "Your data has been restored",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Restore Failed",
          text2: "Failed to restore data",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Restore Failed",
        text2: "An error occurred while restoring",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your glucose readings and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllReadings();
              await clearAuthData();
              Toast.show({
                type: "success",
                text1: "Data Cleared",
                text2: "All data has been cleared",
              });
              logout();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Clear Failed",
                text2: "Failed to clear data",
              });
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    isDestructive = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View
          style={[
            styles.settingIcon,
            isDestructive && styles.settingIconDestructive,
          ]}
        >
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              isDestructive && styles.settingTitleDestructive,
            ]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.textTertiary}
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your app preferences</Text>
          </View>
        </MotiView>

        {/* Security Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 100 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Security" />

            <View style={styles.sectionCard}>
              <SettingItem
                icon="🔐"
                title="Change PIN"
                subtitle="Update your security PIN"
                onPress={() => navigation.navigate("ChangePIN")}
              />

              {biometricSupport && (
                <SettingItem
                  icon="👆"
                  title="Biometric Authentication"
                  subtitle={biometricEnabled ? "Enabled" : "Disabled"}
                  rightElement={
                    <Switch
                      value={biometricEnabled}
                      onValueChange={
                        biometricEnabled ? disableBiometric : enableBiometric
                      }
                      trackColor={{
                        false: COLORS.border,
                        true: COLORS.primary,
                      }}
                      thumbColor={COLORS.white}
                    />
                  }
                />
              )}
            </View>
          </View>
        </MotiView>

        {/* Data Management Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 200 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Data Management" />

            <View style={styles.sectionCard}>
              <SettingItem
                icon="📄"
                title="Export PDF Report"
                subtitle={
                  lastExportDate
                    ? `Last exported: ${new Date(
                        lastExportDate
                      ).toLocaleDateString()}`
                    : "Generate a PDF report"
                }
                onPress={handleExportPDF}
                rightElement={
                  isExporting ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  )
                }
              />

              <SettingItem
                icon="💾"
                title="Backup Data"
                subtitle="Create a local backup of your readings"
                onPress={handleBackup}
                rightElement={
                  isBackingUp ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  )
                }
              />

              <SettingItem
                icon="📥"
                title="Restore Data"
                subtitle="Restore from a previous backup"
                onPress={handleRestore}
                rightElement={
                  isRestoring ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  )
                }
              />
            </View>
          </View>
        </MotiView>

        {/* App Information Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 300 }}
        >
          <View style={styles.section}>
            <SectionHeader title="App Information" />

            <View style={styles.sectionCard}>
              <SettingItem
                icon="📱"
                title="Version"
                subtitle={`${
                  Application.nativeApplicationVersion || "1.0.0"
                } (${Application.nativeBuildVersion || "1"})`}
              />

              <SettingItem
                icon="🔧"
                title="Platform"
                subtitle={`${Platform.OS} ${Platform.Version}`}
              />

              <SettingItem
                icon="📊"
                title="Total Readings"
                subtitle={`${readings.length} glucose readings`}
              />
            </View>
          </View>
        </MotiView>

        {/* Danger Zone */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 400 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Danger Zone" />

            <View style={styles.sectionCard}>
              <SettingItem
                icon="🗑️"
                title="Clear All Data"
                subtitle="Permanently delete all readings and settings"
                onPress={handleClearData}
                isDestructive={true}
                rightElement={
                  isClearing ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.error}
                    />
                  )
                }
              />

              <SettingItem
                icon="🚪"
                title="Sign Out"
                subtitle="Sign out of your account"
                onPress={handleLogout}
                isDestructive={true}
              />
            </View>
          </View>
        </MotiView>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 500 }}
        >
          <View style={styles.footer}>
            <Text style={styles.footerText}>GlucoMate</Text>
            <Text style={styles.footerSubtext}>
              Your trusted glucose tracking companion
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZES.huge,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  settingIconDestructive: {
    backgroundColor: COLORS.errorBg,
  },
  settingIconText: {
    fontSize: FONT_SIZES.lg,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  settingTitleDestructive: {
    color: COLORS.error,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
