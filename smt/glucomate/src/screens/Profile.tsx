import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useProfile } from "../hooks/useProfile";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  FONT_SIZES,
} from "../constants/theme";

export default function Profile() {
  const navigation = useNavigation();
  const { profile, isLoading, updateProfile, updateAvatar, refreshProfile } =
    useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const success = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
      });

      if (success) {
        setIsEditing(false);
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been saved successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
    setIsEditing(false);
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const success = await updateAvatar(result.assets[0].uri);
        if (success) {
          Toast.show({
            type: "success",
            text1: "Avatar Updated",
            text2: "Your profile picture has been updated",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: "Failed to update avatar. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await updateAvatar("");
            if (success) {
              Toast.show({
                type: "success",
                text1: "Avatar Removed",
                text2: "Your profile picture has been removed",
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </MotiView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Avatar Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 100 }}
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {profile?.avatarUri ? (
                  <Image
                    source={{ uri: profile.avatarUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={60}
                      color={COLORS.textTertiary}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.avatarEditButton}
                  onPress={handleImagePicker}
                >
                  <Ionicons name="camera" size={20} color={COLORS.white} />
                </TouchableOpacity>

                {profile?.avatarUri && (
                  <TouchableOpacity
                    style={styles.avatarRemoveButton}
                    onPress={handleRemoveAvatar}
                  >
                    <Ionicons name="close" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>
          </MotiView>

          {/* Profile Form */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
          >
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your name"
                      placeholderTextColor={COLORS.textTertiary}
                      autoCapitalize="words"
                    />
                  ) : (
                    <Text style={styles.displayText}>
                      {profile?.name || "Not set"}
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  ) : (
                    <Text style={styles.displayText}>
                      {profile?.email || "Not set"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </MotiView>

          {/* Action Buttons */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
          >
            <View style={styles.actionSection}>
              {!isEditing ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSave}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={COLORS.white}
                        />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </MotiView>

          {/* Profile Info */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 400 }}
          >
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Profile Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member since</Text>
                  <Text style={styles.infoValue}>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last updated</Text>
                  <Text style={styles.infoValue}>
                    {profile?.updatedAt
                      ? new Date(profile.updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  avatarRemoveButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  avatarHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  formSection: {
    marginBottom: SPACING.xxxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  formCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  displayText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  actionSection: {
    marginBottom: SPACING.xxxl,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
  editActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});
