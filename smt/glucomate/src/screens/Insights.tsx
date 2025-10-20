import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useReadings } from "../hooks/useReadings";
import { getWeeklyInsight, getDetailedStats } from "../utils/insights";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

type ChartView = "line" | "pie";

export default function Insights() {
  const { readings, refresh } = useReadings();
  const [chartView, setChartView] = useState<ChartView>("line");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const weeklyInsight = getWeeklyInsight(readings);
  const stats14Days = getDetailedStats(readings, 14);

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

  // Chart data processing for react-native-chart-kit
  const getLineChartData = () => {
    const last14Days = readings
      .filter((reading) => {
        const readingDate = new Date(reading.timestamp);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        return readingDate >= fourteenDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    if (last14Days.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      };
    }

    const labels = last14Days.map((reading) => {
      const date = new Date(reading.timestamp);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    });

    const data = last14Days.map((reading) => reading.value);

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const getPieChartDataForLibrary = () => {
    const total = readings.length;
    if (total === 0) return [];

    const lowCount = readings.filter((r) => r.value < 70).length;
    const normalCount = readings.filter(
      (r) => r.value >= 70 && r.value <= 140
    ).length;
    const highCount = readings.filter((r) => r.value > 140).length;

    const data = [
      {
        name: "Low",
        population: lowCount,
        color: "#ef4444",
        legendFontColor: COLORS.textPrimary,
        legendFontSize: 12,
      },
      {
        name: "Normal",
        population: normalCount,
        color: "#22c55e",
        legendFontColor: COLORS.textPrimary,
        legendFontSize: 12,
      },
      {
        name: "High",
        population: highCount,
        color: "#f97316",
        legendFontColor: COLORS.textPrimary,
        legendFontSize: 12,
      },
    ].filter((item) => item.population > 0);

    return data;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderLineChart = () => {
    const chartData = getLineChartData();

    if (chartData.labels.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons
            name="analytics-outline"
            size={48}
            color={COLORS.textTertiary}
          />
          <Text style={styles.emptyChartText}>No data to display</Text>
          <Text style={styles.emptyChartSubtext}>
            Add some readings to see your trends
          </Text>
        </View>
      );
    }

    const chartConfig = {
      backgroundColor: COLORS.white,
      backgroundGradientFrom: COLORS.white,
      backgroundGradientTo: COLORS.white,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
      style: {
        borderRadius: BORDER_RADIUS.md,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: COLORS.white,
      },
      propsForBackgroundLines: {
        strokeDasharray: "5,5",
        stroke: COLORS.borderLight,
        strokeWidth: 1,
      },
    };

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 80}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
        />
      </View>
    );
  };

  const renderPieChart = () => {
    const pieData = getPieChartDataForLibrary();

    if (pieData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons
            name="pie-chart-outline"
            size={48}
            color={COLORS.textTertiary}
          />
          <Text style={styles.emptyChartText}>No data to display</Text>
          <Text style={styles.emptyChartSubtext}>
            Add some readings to see distribution
          </Text>
        </View>
      );
    }

    const chartConfig = {
      backgroundColor: COLORS.white,
      backgroundGradientFrom: COLORS.white,
      backgroundGradientTo: COLORS.white,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    return (
      <View style={styles.pieChartContainer}>
        <PieChart
          data={pieData}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
        />
      </View>
    );
  };

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    color = COLORS.textPrimary,
  }: {
    icon: string;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const InsightCard = ({
    icon,
    title,
    description,
    color = COLORS.primary,
  }: {
    icon: string;
    title: string;
    description: string;
    color?: string;
  }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{icon}</Text>
        <Text style={styles.insightTitle}>{title}</Text>
      </View>
      <Text style={styles.insightDescription}>{description}</Text>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (readings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 600 }}
          >
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Insights Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first glucose reading to start tracking your levels and
                see personalized insights
              </Text>
            </View>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>
              Your glucose trends and patterns
            </Text>
          </View>
        </MotiView>

        {/* Weekly Insight */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 600, delay: 100 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Weekly Insight" />
            <InsightCard
              icon="✨"
              title="Smart Analysis"
              description={weeklyInsight}
              color={COLORS.primary}
            />
          </View>
        </MotiView>

        {/* Trend Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 200 }}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {chartView === "line" ? "14-Day Trend" : "Distribution"}
              </Text>
              <View style={styles.chartToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    chartView === "line" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setChartView("line")}
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={
                      chartView === "line" ? COLORS.white : COLORS.textSecondary
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    chartView === "pie" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setChartView("pie")}
                >
                  <Ionicons
                    name="pie-chart-outline"
                    size={16}
                    color={
                      chartView === "pie" ? COLORS.white : COLORS.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>
                  {chartView === "line"
                    ? "Glucose Levels"
                    : "Reading Distribution"}
                </Text>
                <Text style={styles.chartSubtitle}>
                  {chartView === "line"
                    ? `${readings.length} reading${
                        readings.length !== 1 ? "s" : ""
                      } in the last 14 days`
                    : `${readings.length} total reading${
                        readings.length !== 1 ? "s" : ""
                      }`}
                </Text>
              </View>
              {chartView === "line" ? renderLineChart() : renderPieChart()}
            </View>
          </View>
        </MotiView>

        {/* Statistics Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 300 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Statistics" />
            <View style={styles.statsGrid}>
              <StatCard
                icon="📈"
                title="Average"
                value={Math.round(stats14Days.average)}
                subtitle="mg/dL"
                color={COLORS.primary}
              />
              <StatCard
                icon="⬆️"
                title="Highest"
                value={stats14Days.highest?.value || 0}
                subtitle="mg/dL"
                color={COLORS.glucoseHigh}
              />
              <StatCard
                icon="⬇️"
                title="Lowest"
                value={stats14Days.lowest?.value || 0}
                subtitle="mg/dL"
                color={COLORS.glucoseLow}
              />
              <StatCard
                icon="📊"
                title="Total"
                value={stats14Days.total}
                subtitle="readings"
                color={COLORS.textPrimary}
              />
            </View>
          </View>
        </MotiView>

        {/* Range Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 400 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Range Analysis" />
            <View style={styles.rangeCard}>
              <View style={styles.rangeHeader}>
                <Text style={styles.rangeTitle}>Glucose Distribution</Text>
                <Text style={styles.rangeSubtitle}>Last 14 days</Text>
              </View>

              <View style={styles.rangeBars}>
                <View style={styles.rangeBar}>
                  <View style={styles.rangeBarLabel}>
                    <View
                      style={[
                        styles.rangeBarColor,
                        { backgroundColor: COLORS.glucoseLow },
                      ]}
                    />
                    <Text style={styles.rangeBarText}>Low (&lt;70)</Text>
                  </View>
                  <View style={styles.rangeBarContainer}>
                    <View
                      style={[
                        styles.rangeBarFill,
                        {
                          backgroundColor: COLORS.glucoseLow,
                          width: `${Math.max(
                            (stats14Days.lowCount / stats14Days.total) * 100,
                            5
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rangeBarValue}>
                    {stats14Days.lowCount}
                  </Text>
                </View>

                <View style={styles.rangeBar}>
                  <View style={styles.rangeBarLabel}>
                    <View
                      style={[
                        styles.rangeBarColor,
                        { backgroundColor: COLORS.glucoseNormal },
                      ]}
                    />
                    <Text style={styles.rangeBarText}>Normal (70-140)</Text>
                  </View>
                  <View style={styles.rangeBarContainer}>
                    <View
                      style={[
                        styles.rangeBarFill,
                        {
                          backgroundColor: COLORS.glucoseNormal,
                          width: `${Math.max(
                            (stats14Days.inRange / stats14Days.total) * 100,
                            5
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rangeBarValue}>
                    {stats14Days.inRange}
                  </Text>
                </View>

                <View style={styles.rangeBar}>
                  <View style={styles.rangeBarLabel}>
                    <View
                      style={[
                        styles.rangeBarColor,
                        { backgroundColor: COLORS.glucoseHigh },
                      ]}
                    />
                    <Text style={styles.rangeBarText}>High (&gt;140)</Text>
                  </View>
                  <View style={styles.rangeBarContainer}>
                    <View
                      style={[
                        styles.rangeBarFill,
                        {
                          backgroundColor: COLORS.glucoseHigh,
                          width: `${Math.max(
                            (stats14Days.highCount / stats14Days.total) * 100,
                            5
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rangeBarValue}>
                    {stats14Days.highCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Recent Readings */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 500 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Recent Readings" />
            <View style={styles.readingsCard}>
              {readings.slice(0, 5).map((reading, index) => (
                <View key={reading.id} style={styles.readingItem}>
                  <View style={styles.readingLeft}>
                    <View
                      style={[
                        styles.readingValueContainer,
                        {
                          backgroundColor: `${getGlucoseColor(
                            reading.value
                          )}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.readingValue,
                          { color: getGlucoseColor(reading.value) },
                        ]}
                      >
                        {reading.value}
                      </Text>
                    </View>
                    <View style={styles.readingInfo}>
                      <Text style={styles.readingType}>{reading.type}</Text>
                      <Text style={styles.readingDate}>
                        {formatDate(reading.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.readingStatus,
                      { backgroundColor: getGlucoseColor(reading.value) },
                    ]}
                  >
                    <Text style={styles.readingStatusText}>
                      {getGlucoseStatus(reading.value)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </MotiView>

        {/* Tips */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 600 }}
        >
          <View style={styles.section}>
            <SectionHeader title="Health Tips" />
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Text style={styles.tipsIcon}>💡</Text>
                <Text style={styles.tipsTitle}>Expert Recommendations</Text>
              </View>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>
                  • Test at consistent times each day
                </Text>
                <Text style={styles.tipItem}>
                  • Track patterns in your readings
                </Text>
                <Text style={styles.tipItem}>
                  • Note what you eat before high readings
                </Text>
                <Text style={styles.tipItem}>• Stay hydrated and active</Text>
                <Text style={styles.tipItem}>
                  • Consult your healthcare provider regularly
                </Text>
              </View>
            </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Insight Card
  insightCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
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
  insightDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Chart Styles
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chartHeader: {
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  chartSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chartContainer: {
    position: "relative",
    height: 160,
    width: "100%",
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  chartArea: {
    position: "relative",
    height: 120,
    width: "100%",
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: COLORS.borderLight,
    opacity: 0.3,
  },
  targetRange: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: `${COLORS.glucoseNormal}20`,
    borderRadius: BORDER_RADIUS.xs,
  },
  chartLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    ...SHADOWS.sm,
  },
  valueLabels: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  valueLabel: {
    position: "absolute",
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: "center",
    width: 30,
  },
  dateLabels: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  dateLabel: {
    position: "absolute",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: "center",
    width: 30,
    bottom: 0,
  },
  chartEmpty: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  chartEmptyIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  chartEmptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: "center",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  statCard: {
    width: (screenWidth - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  statIcon: {
    fontSize: FONT_SIZES.lg,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },

  // Range Analysis
  rangeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rangeHeader: {
    marginBottom: SPACING.lg,
  },
  rangeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  rangeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  rangeBars: {
    gap: SPACING.md,
  },
  rangeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  rangeBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 100,
  },
  rangeBarColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  rangeBarText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  rangeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.xs,
    overflow: "hidden",
  },
  rangeBarFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.xs,
  },
  rangeBarValue: {
    width: 30,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: "right",
  },

  // Recent Readings
  readingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  readingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  readingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  readingValueContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  readingValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  readingInfo: {
    flex: 1,
  },
  readingType: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  readingDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  readingStatus: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  readingStatusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  tipsIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Chart Toggle Styles
  chartToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },

  // Enhanced Chart Styles
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyChartText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyChartSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },

  // Line Chart Styles
  lineSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },

  // Pie Chart Styles
  pieChartContainer: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  pieChartArea: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
    overflow: "hidden",
  },
  pieSlice: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    transformOrigin: "60px 60px",
  },
  pieCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  pieCenterText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  pieCenterSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  pieLegend: {
    width: "100%",
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  legendValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
