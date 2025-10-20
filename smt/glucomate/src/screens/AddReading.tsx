import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { ReadingType } from "../types/reading";
import { saveReading } from "../utils/storage";
import TypePicker from "../components/TypePicker";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
  SHADOWS,
} from "../constants/theme";

type RootStackParamList = {
  MainTabs: undefined;
  AddReading: undefined;
};

type AddReadingProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddReading">;
};

export default function AddReading({ navigation }: AddReadingProps) {
  const [glucoseLevel, setGlucoseLevel] = useState("");
  const [readingType, setReadingType] = useState<ReadingType>("Random");
  const [timestamp, setTimestamp] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newTimestamp = new Date(timestamp);
      newTimestamp.setFullYear(selectedDate.getFullYear());
      newTimestamp.setMonth(selectedDate.getMonth());
      newTimestamp.setDate(selectedDate.getDate());
      setTimestamp(newTimestamp);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newTimestamp = new Date(timestamp);
      newTimestamp.setHours(selectedTime.getHours());
      newTimestamp.setMinutes(selectedTime.getMinutes());
      setTimestamp(newTimestamp);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const validateInput = (): boolean => {
    const value = parseFloat(glucoseLevel);

    if (!glucoseLevel || isNaN(value)) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Please enter a valid glucose level",
      });
      return false;
    }

    if (value <= 0 || value > 600) {
      Toast.show({
        type: "error",
        text1: "Invalid Range",
        text2: "Glucose level must be between 1 and 600 mg/dL",
      });
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateInput()) {
      return;
    }

    setIsSaving(true);

    try {
      const value = parseFloat(glucoseLevel);
      const result = await saveReading(
        value,
        readingType,
        timestamp.getTime(),
        notes.trim() || undefined
      );

      if (result) {
        Toast.show({
          type: "success",
          text1: "Reading Saved! ✓",
          text2: `${value} mg/dL • ${readingType}`,
        });

        setTimeout(() => {
          navigation.goBack();
        }, 300);
      } else {
        Toast.show({
          type: "error",
          text1: "Save Failed",
          text2: "Failed to save reading. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving reading:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", duration: 600 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Add Reading</Text>
            <Text style={styles.headerSubtitle}>Record your glucose level</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </MotiView>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Glucose Level Input */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                duration: 600,
                delay: 100,
              }}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Glucose Level</Text>
                <View style={styles.glucoseCard}>
                  <View style={styles.glucoseInputWrapper}>
                    <TextInput
                      style={styles.glucoseInput}
                      value={glucoseLevel}
                      onChangeText={setGlucoseLevel}
                      keyboardType="decimal-pad"
                      placeholder="120"
                      placeholderTextColor={COLORS.textTertiary}
                      maxLength={5}
                      returnKeyType="done"
                    />
                    <Text style={styles.unit}>mg/dL</Text>
                  </View>
                  <View style={styles.rangeIndicator}>
                    <Text style={styles.rangeText}>
                      Normal range: 70-140 mg/dL
                    </Text>
                  </View>
                </View>
              </View>
            </MotiView>

            {/* Reading Type Picker */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                duration: 600,
                delay: 200,
              }}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reading Type</Text>
                <TypePicker value={readingType} onChange={setReadingType} />
              </View>
            </MotiView>

            {/* Date and Time Selectors */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                duration: 600,
                delay: 300,
              }}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Date & Time</Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={styles.dateTimeCard}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeIconContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.dateTimeContent}>
                      <Text style={styles.dateTimeLabel}>Date</Text>
                      <Text style={styles.dateTimeValue}>
                        {formatDate(timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeCard}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeIconContainer}>
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.dateTimeContent}>
                      <Text style={styles.dateTimeLabel}>Time</Text>
                      <Text style={styles.dateTimeValue}>
                        {formatTime(timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </MotiView>

            {/* Notes Input */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                duration: 600,
                delay: 400,
              }}
            >
              <View style={styles.section}>
                <View style={styles.notesHeader}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.optionalBadge}>Optional</Text>
                </View>
                <View style={styles.notesCard}>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add any notes about this reading..."
                    placeholderTextColor={COLORS.textTertiary}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                  <Text style={styles.charCount}>{notes.length}/200</Text>
                </View>
              </View>
            </MotiView>

            {/* Action Buttons */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                duration: 600,
                delay: 500,
              }}
            >
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSaving && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.white}
                  />
                  <Text style={styles.saveButtonText}>
                    {isSaving ? "Saving..." : "Save Reading"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={timestamp}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={timestamp}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.huge * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 0.2,
  },

  // Glucose Input
  glucoseCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  glucoseInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  glucoseInput: {
    fontSize: 64,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
    textAlign: "center",
    minWidth: 120,
    letterSpacing: -2,
  },
  unit: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.sm,
    marginTop: SPACING.lg,
  },
  rangeIndicator: {
    backgroundColor: COLORS.primaryBg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
  },
  rangeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Date Time
  dateTimeRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dateTimeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs / 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTimeValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Notes
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  optionalBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    fontWeight: FONT_WEIGHTS.medium,
  },
  notesCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  notesInput: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 100,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: "right",
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Actions
  actionsContainer: {
    marginTop: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.primary,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },
  cancelButton: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
