import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useReadings } from "../hooks/useReadings";
import { useProfile } from "../hooks/useProfile";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { generateInsight, getTrend, getTrendEmoji } from "../utils/insights";
import { getPersonalizedGreeting } from "../utils/userProfile";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

type RootStackParamList = {
  MainTabs: undefined;
  AddReading: undefined;
  Profile: undefined;
};

type DashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MainTabs">;
};

export default function Dashboard({ navigation }: DashboardProps) {
  const { logout } = useAuth();
  const { profile } = useProfile();
  const { readings, stats, isLoading, refresh } = useReadings();
  const [greeting, setGreeting] = useState("Hello! 👋");

  useEffect(() => {
    loadGreeting();
  }, []);

  const loadGreeting = async () => {
    const personalizedGreeting = await getPersonalizedGreeting();
    setGreeting(personalizedGreeting);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadGreeting();
    }, [refresh])
  );

  const latestReading = readings.length > 0 ? readings[0] : null;
  const insight = generateInsight(readings, latestReading, stats.average);
  const trend = getTrend(readings);
  const trendEmoji = getTrendEmoji(trend);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getGlucoseColor = (value: number): string => {
    if (value < 70) return COLORS.glucoseLow;
    if (value > 140) return COLORS.glucoseHigh;
    return COLORS.glucoseNormal;
  };

  const getGlucoseStatus = (value: number): string => {
    if (value < 70) return "Low";
    if (value > 140) return "High";
    return "Normal";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Compact Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600 }}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.title}>Dashboard</Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
            >
              {profile?.avatarUri ? (
                <Image
                  source={{ uri: profile.avatarUri }}
                  style={styles.profileAvatar}
                />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Ionicons name="person" size={18} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </MotiView>

        <View style={styles.content}>
          {isLoading && readings.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your data...</Text>
            </View>
          ) : (
            <>
              {/* Hero Section */}
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 600, delay: 100 }}
              >
                <View style={styles.heroCard}>
                  {latestReading ? (
                    <>
                      <View style={styles.heroTop}>
                        <View style={styles.heroTopLeft}>
                          <Text style={styles.heroLabel}>Latest Reading</Text>
                          <Text style={styles.heroTime}>
                            {formatDate(latestReading.timestamp)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.heroTypeBadge,
                            {
                              backgroundColor: `${getGlucoseColor(
                                latestReading.value
                              )}15`,
                            },
                          ]}
                        >
                          <Text style={styles.heroTypeEmoji}>
                            {latestReading.type === "Fasting"
                              ? "🌅"
                              : latestReading.type === "Post-meal"
                              ? "🍽️"
                              : "⏰"}
                          </Text>
                          <Text
                            style={[
                              styles.heroTypeText,
                              { color: getGlucoseColor(latestReading.value) },
                            ]}
                          >
                            {latestReading.type}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.heroMain}>
                        <Text
                          style={[
                            styles.heroValue,
                            { color: getGlucoseColor(latestReading.value) },
                          ]}
                        >
                          {latestReading.value}
                        </Text>
                        <Text style={styles.heroUnit}>mg/dL</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptyHero}>
                      <Text style={styles.emptyHeroIcon}>📊</Text>
                      <Text style={styles.emptyHeroText}>No readings yet</Text>
                      <Text style={styles.emptyHeroSubtext}>
                        Add your first reading to get started
                      </Text>
                    </View>
                  )}
                </View>
              </MotiView>

              {/* Quick Stats Grid */}
              {readings.length > 0 && (
                <MotiView
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", duration: 600, delay: 200 }}
                >
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <View style={styles.statIconContainer}>
                        <Text style={styles.statIcon}>📈</Text>
                      </View>
                      <Text style={styles.statValue}>
                        {stats.average > 0 ? stats.average : "--"}
                      </Text>
                      <Text style={styles.statLabel}>7-Day Average</Text>
                      <Text style={styles.statUnit}>mg/dL</Text>
                    </View>

                    <View style={styles.statCard}>
                      <View style={styles.statIconContainer}>
                        <Text style={styles.statIcon}>📊</Text>
                      </View>
                      <Text style={styles.statValue}>{stats.total}</Text>
                      <Text style={styles.statLabel}>Total Readings</Text>
                      <Text style={styles.statUnit}>count</Text>
                    </View>
                  </View>
                </MotiView>
              )}

              {/* Range Indicators */}
              {stats.highest && stats.lowest && (
                <MotiView
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", duration: 600, delay: 300 }}
                >
                  <View style={styles.rangeSection}>
                    <View style={styles.rangeContainer}>
                      <View style={styles.rangeCard}>
                        <View style={styles.rangeItem}>
                          <Text style={styles.rangeIcon}>⬆️</Text>
                          <View style={styles.rangeContent}>
                            <Text style={styles.rangeLabel}>Highest</Text>
                            <Text style={styles.rangeValue}>
                              {stats.highest.value}{" "}
                              <Text style={styles.rangeUnit}>mg/dL</Text>
                            </Text>
                          </View>
                        </View>

                        <View style={styles.rangeDivider} />

                        <View style={styles.rangeItem}>
                          <Text style={styles.rangeIcon}>⬇️</Text>
                          <View style={styles.rangeContent}>
                            <Text style={styles.rangeLabel}>Lowest</Text>
                            <Text style={styles.rangeValue}>
                              {stats.lowest.value}{" "}
                              <Text style={styles.rangeUnit}>mg/dL</Text>
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </MotiView>
              )}

              {/* Insight Card */}
              {readings.length > 0 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 600, delay: 400 }}
                >
                  <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <Text style={styles.insightIcon}>{trendEmoji}</Text>
                      <Text style={styles.insightTitle}>Smart Insight</Text>
                    </View>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                </MotiView>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 600, delay: 300 }}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddReading")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </MotiView>
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
  // Header Styles (Compact & Modern)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs / 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 0,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.huge,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textTertiary,
  },

  // Hero Card Styles (Compact)
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  heroTopLeft: {
    flex: 1,
  },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs / 2,
  },
  heroTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  heroTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs / 2,
  },
  heroTypeEmoji: {
    fontSize: FONT_SIZES.sm,
  },
  heroTypeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  emptyHero: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyHeroIcon: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  emptyHeroText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyHeroSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Stats Grid Styles
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statIcon: {
    fontSize: FONT_SIZES.xl,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  statUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },

  // Range Section Styles
  rangeSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  // Range Overview Styles (Compact)
  rangeContainer: {
    marginBottom: SPACING.md,
  },
  rangeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rangeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  rangeIcon: {
    fontSize: FONT_SIZES.xl,
  },
  rangeContent: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs / 2,
  },
  rangeValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  rangeUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  rangeDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },

  // Insight Card Styles
  insightCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  insightIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  insightTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  insightText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Add Button Styles
  // Floating Action Button
  fabContainer: {
    position: "absolute",
    right: SPACING.xl,
    bottom: SPACING.xl + SPACING.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.xl,
  },
});
