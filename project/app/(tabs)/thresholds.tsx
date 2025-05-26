import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Search, FileSliders as Sliders, Check, RotateCcw, ChevronDown, ArrowUpDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/Header';
import ThresholdCard from '@/components/ThresholdCard';
import { useSensors } from '@/context/SensorContext';
import { SensorType, SensorThreshold } from '@/types';
import { SENSORS } from '@/constants/Sensors';
import EmptyState from '@/components/EmptyState';
import ThresholdFilterMenu from '@/components/ThresholdFilterMenu';

export default function ThresholdsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { 
    thresholds = [], // Provide default empty array
    isLoading,
    fetchThresholds,
    fetchReadings,
  } = useSensors();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'value'>('name');
  const [activeFilter, setActiveFilter] = useState<'all' | 'alerts' | 'normal'>('all');
  
  // Refresh data
  const handleRefresh = async () => {
    await Promise.all([fetchThresholds(), fetchReadings()]);
  };

  // Effect to refresh data on initial render
  useEffect(() => {
    handleRefresh();
  }, []);

  // Filter and sort thresholds
  const filteredThresholds = (thresholds || []) // Ensure thresholds is an array
    .filter(threshold => {
      // Apply search filter
      const sensorInfo = SENSORS[threshold.sensor_type];
      const matchesSearch = searchQuery === '' || 
        sensorInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      if (activeFilter === 'all') return matchesSearch;
      
      // Note: In a real app, we would compare actual readings against thresholds
      // For this demo, we'll use random values
      const hasAlert = Math.random() > 0.7;
      return matchesSearch && (
        (activeFilter === 'alerts' && hasAlert) ||
        (activeFilter === 'normal' && !hasAlert)
      );
    })
    .sort((a, b) => {
      // Sort by name or value
      if (sortBy === 'name') {
        const nameA = SENSORS[a.sensor_type].name;
        const nameB = SENSORS[b.sensor_type].name;
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const valueA = a.max_value - a.min_value;
        const valueB = b.max_value - b.min_value;
        return sortOrder === 'asc' 
          ? valueA - valueB
          : valueB - valueA;
      }
    });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Change sort field
  const changeSortBy = (field: 'name' | 'value') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Sensor Thresholds" />
      
      <View style={styles.content}>
        {/* Search and filter bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.neutral[100] }]}>
            <Search size={18} color={colors.neutral[500]} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search sensors..."
              placeholderTextColor={colors.neutral[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colors.neutral[100] }]}
            onPress={() => setFilterMenuVisible(true)}
          >
            <Sliders size={18} color={colors.primary.main} />
            <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Filter chips */}
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'all' && { backgroundColor: colors.primary.main }
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[
              styles.filterChipText, 
              { color: activeFilter === 'all' ? 'white' : colors.text }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'alerts' && { backgroundColor: colors.error.main }
            ]}
            onPress={() => setActiveFilter('alerts')}
          >
            <Text style={[
              styles.filterChipText, 
              { color: activeFilter === 'alerts' ? 'white' : colors.text }
            ]}>
              Alerts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip, 
              activeFilter === 'normal' && { backgroundColor: colors.success.main }
            ]}
            onPress={() => setActiveFilter('normal')}
          >
            <Text style={[
              styles.filterChipText, 
              { color: activeFilter === 'normal' ? 'white' : colors.text }
            ]}>
              Normal
            </Text>
          </TouchableOpacity>
          
          <View style={{ flex: 1 }} />
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => changeSortBy('name')}
          >
            <Text style={[
              styles.sortText, 
              { 
                color: sortBy === 'name' ? colors.primary.main : colors.text,
                fontWeight: sortBy === 'name' ? '600' : 'normal',
              }
            ]}>
              Name
            </Text>
            {sortBy === 'name' && (
              <ArrowUpDown size={14} color={colors.primary.main} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => changeSortBy('value')}
          >
            <Text style={[
              styles.sortText, 
              { 
                color: sortBy === 'value' ? colors.primary.main : colors.text,
                fontWeight: sortBy === 'value' ? '600' : 'normal',
              }
            ]}>
              Range
            </Text>
            {sortBy === 'value' && (
              <ArrowUpDown size={14} color={colors.primary.main} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Threshold list */}
        {!thresholds || thresholds.length === 0 ? (
          <EmptyState
            icon={<Sliders size={48} color={colors.neutral[400]} />}
            title="No thresholds configured"
            description="You haven't set up any sensor thresholds yet."
            actionLabel="Refresh"
            onAction={handleRefresh}
            isLoading={isLoading}
          />
        ) : filteredThresholds.length === 0 ? (
          <EmptyState
            icon={<Search size={48} color={colors.neutral[400]} />}
            title="No matching thresholds"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          />
        ) : (
          <FlatList
            data={filteredThresholds}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ThresholdCard threshold={item} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={colors.primary.main}
              />
            }
          />
        )}
      </View>
      
      {/* Filter menu */}
      <ThresholdFilterMenu
        visible={filterMenuVisible}
        onClose={() => setFilterMenuVisible(false)}
        onReset={() => {
          setSearchQuery('');
          setActiveFilter('all');
          setSortBy('name');
          setSortOrder('asc');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
    fontFamily: 'Inter-Medium',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    height: 32,
  },
  sortText: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    paddingBottom: 20,
  },
});