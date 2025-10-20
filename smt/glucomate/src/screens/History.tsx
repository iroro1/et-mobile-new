import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  Table,
  Row,
  Rows,
  TableWrapper,
  Cell,
} from "react-native-table-component";
import { useReadings } from "../hooks/useReadings";
import { GlucoseReading } from "../types/reading";
import FilterModal, { FilterOptions } from "../components/FilterModal";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
  SHADOWS,
} from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

type RootStackParamList = {
  EditReading: { reading: GlucoseReading };
};

export default function History() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { readings, isLoading, refresh, deleteReading } = useReadings();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "All",
    dateRange: "all",
  });

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Filter readings based on selected filters
  const filteredReadings = useMemo(() => {
    let filtered = [...readings];

    // Filter by type
    if (filters.type !== "All") {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    // Filter by date range
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    switch (filters.dateRange) {
      case "today":
        const todayStart = new Date(now).setHours(0, 0, 0, 0);
        filtered = filtered.filter((r) => r.timestamp >= todayStart);
        break;
      case "week":
        const weekAgo = now - 7 * oneDayMs;
        filtered = filtered.filter((r) => r.timestamp >= weekAgo);
        break;
      case "month":
        const monthAgo = now - 30 * oneDayMs;
        filtered = filtered.filter((r) => r.timestamp >= monthAgo);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    return filtered;
  }, [readings, filters]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
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

  // Table data preparation
  const getTableData = () => {
    const tableHead = ["Value", "Type", "Date", "Status", "Actions"];
    const tableData = filteredReadings.map((reading) => [
      `${reading.value} mg/dL`,
      reading.type,
      formatDate(reading.timestamp),
      getGlucoseStatus(reading.value),
      "", // Actions will be handled separately
    ]);
    return { tableHead, tableData };
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "Fasting":
        return "🌅";
      case "Post-meal":
        return "🍽️";
      case "Random":
        return "⏰";
      default:
        return "📊";
    }
  };

  const handleEditReading = (item: GlucoseReading) => {
    navigation.navigate("EditReading", { reading: item });
  };

  const handleDeleteReading = (item: GlucoseReading) => {
    Alert.alert(
      "Delete Reading",
      "Are you sure you want to delete this reading?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteReading(item.id);
            if (success) {
              Toast.show({
                type: "success",
                text1: "Reading Deleted",
                text2: `${item.value} mg/dL reading removed`,
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: "Failed to delete reading. Please try again.",
              });
            }
          },
        },
      ]
    );
  };

  const renderCardItem = ({
    item,
    index,
  }: {
    item: GlucoseReading;
    index: number;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        duration: 400,
        delay: index * 50,
      }}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleEditReading(item)}
        onLongPress={() => handleDeleteReading(item)}
      >
        {/* Main Row: Value and Info */}
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <View style={styles.valueRow}>
              <Text
                style={[
                  styles.glucoseValue,
                  { color: getGlucoseColor(item.value) },
                ]}
              >
                {item.value}
              </Text>
              <Text style={styles.unit}>mg/dL</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.typeText}>
                {getTypeIcon(item.type)} {item.type}
              </Text>
              <Text style={styles.dateDivider}>•</Text>
              <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>

          <View style={styles.cardRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getGlucoseColor(item.value) },
              ]}
            >
              <Text style={styles.statusText}>
                {getGlucoseStatus(item.value)}
              </Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEditReading(item)}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDeleteReading(item)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes Section (if present) */}
        {item.notes && (
          <View style={styles.notesSection}>
            <Ionicons
              name="document-text-outline"
              size={12}
              color={COLORS.textTertiary}
            />
            <Text style={styles.notesText} numberOfLines={1}>
              {item.notes}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );

  const renderHeader = () => {
    const activeFilterCount =
      (filters.type !== "All" ? 1 : 0) + (filters.dateRange !== "all" ? 1 : 0);

    return (
      <View style={styles.headerInfo}>
        <View style={styles.statsRow}>
          <Text style={styles.headerInfoText}>
            {filteredReadings.length} of {readings.length} reading
            {readings.length !== 1 ? "s" : ""}
          </Text>
          <View style={styles.headerActions}>
            {/* View Mode Toggle */}
            <View style={styles.viewModeToggle}>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === "cards" && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode("cards")}
              >
                <Ionicons
                  name="grid-outline"
                  size={16}
                  color={
                    viewMode === "cards" ? COLORS.white : COLORS.textSecondary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === "table" && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode("table")}
              >
                <Ionicons
                  name="list-outline"
                  size={16}
                  color={
                    viewMode === "table" ? COLORS.white : COLORS.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Filter Button */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilterCount > 0 && styles.filterButtonActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons
                name="filter-outline"
                size={14}
                color={
                  activeFilterCount > 0 ? COLORS.primary : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilterCount > 0 && styles.filterButtonTextActive,
                ]}
              >
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real Table Component */}
        {viewMode === "table" && filteredReadings.length > 0 && (
          <View style={styles.tableContainer}>
            <Table borderStyle={styles.tableBorder}>
              <Row
                data={getTableData().tableHead}
                style={styles.tableHead}
                textStyle={styles.tableHeadText}
                widthArr={[100, 100, 120, 80, 100]}
              />
              <Rows
                data={getTableData().tableData}
                style={styles.tableRow}
                textStyle={styles.tableRowText}
                widthArr={[100, 100, 120, 80, 100]}
              />
            </Table>
          </View>
        )}

        {activeFilterCount > 0 && (
          <View style={styles.activeFilters}>
            {filters.type !== "All" && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{filters.type}</Text>
              </View>
            )}
            {filters.dateRange !== "all" && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {filters.dateRange === "today" && "Today"}
                  {filters.dateRange === "week" && "Last 7 Days"}
                  {filters.dateRange === "month" && "Last 30 Days"}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (filteredReadings.length === 0 && !isLoading) {
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
              <Text style={styles.emptyIcon}>
                {readings.length === 0 ? "📊" : "🔍"}
              </Text>
              <Text style={styles.emptyTitle}>
                {readings.length === 0
                  ? "No readings yet"
                  : "No matching readings"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {readings.length === 0
                  ? "Add your first glucose reading to get started tracking your levels"
                  : "Try adjusting your filters to see more results"}
              </Text>
              {readings.length > 0 && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => setFilters({ type: "All", dateRange: "all" })}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
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
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>Your glucose reading history</Text>
          </View>
        </MotiView>

        {/* Controls */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 100 }}
        >
          {renderHeader()}
        </MotiView>

        {/* Readings List */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 600, delay: 200 }}
        >
          <View style={styles.listContainer}>
            {viewMode === "cards" ? (
              <FlatList
                data={filteredReadings}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.cardsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={refresh} />
                }
              />
            ) : (
              <View style={styles.tableContainer}>
                {/* Table is rendered above in the controls section */}
              </View>
            )}
          </View>
        </MotiView>
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
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
  headerInfo: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headerInfoText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
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
    marginBottom: SPACING.xl,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  clearFiltersText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // List Container
  listContainer: {
    paddingHorizontal: SPACING.xl,
  },
  cardsList: {
    gap: SPACING.md,
  },
  // Real Table Styles
  tableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    overflow: "hidden",
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tableHead: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
  tableHeadText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
    textAlign: "center",
  },
  tableRow: {
    backgroundColor: COLORS.white,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    textAlign: "center",
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Card Styles (Compact)
  cardWrapper: {
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Card Main Row
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  glucoseValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extrabold,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  typeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  dateDivider: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  iconButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundDark,
  },

  // Notes Section
  notesSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  notesText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
