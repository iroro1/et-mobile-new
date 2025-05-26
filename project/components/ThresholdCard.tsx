import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  useColorScheme 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { TriangleAlert as AlertTriangle, ChevronDown, CreditCard as Edit, RefreshCw, Save } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { SensorThreshold, SensorType } from '@/types';
import { SENSORS } from '@/constants/Sensors';
import ThresholdSlider from './ThresholdSlider';
import { useSensors } from '@/context/SensorContext';
import Button from './Button';
import ConfirmationDialog from './ConfirmationDialog';

interface ThresholdCardProps {
  threshold: SensorThreshold;
}

const ThresholdCard: React.FC<ThresholdCardProps> = ({ threshold }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const sensorInfo = SENSORS[threshold.sensor_type];
  const { updateThreshold, isLoading } = useSensors();
  
  // Local state
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [minValue, setMinValue] = useState<number>(threshold.min_value);
  const [maxValue, setMaxValue] = useState<number>(threshold.max_value);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'save' | 'reset'>('save');
  
  // Animation values
  const rotateZ = useSharedValue(0);
  const height = useSharedValue(88);
  const contentHeight = useSharedValue(0);
  
  // Calculate if there are unsaved changes
  const hasChanges = minValue !== threshold.min_value || maxValue !== threshold.max_value;
  
  // Simulate if threshold has alerts
  // In a real app, we would compare actual readings against thresholds
  const hasAlert = Math.random() > 0.7;
  
  // Get simulated last modified date
  const lastModified = new Date();
  lastModified.setDate(lastModified.getDate() - Math.floor(Math.random() * 30));
  
  // Handle threshold changes
  const handleThresholdChange = (min: number, max: number) => {
    setMinValue(min);
    setMaxValue(max);
  };
  
  // Save changes
  const saveChanges = async () => {
    await updateThreshold(threshold.id, {
      min_value: minValue,
      max_value: maxValue,
    });
    setEditMode(false);
  };
  
  // Reset changes
  const resetChanges = () => {
    setMinValue(threshold.min_value);
    setMaxValue(threshold.max_value);
    setEditMode(false);
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    // If in edit mode with unsaved changes, show confirmation
    if (editMode && hasChanges) {
      setConfirmationType('save');
      setShowConfirmation(true);
      return;
    }
    
    // Otherwise toggle expanded state
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    // Animate rotation
    rotateZ.value = withTiming(newExpanded ? 180 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Animate height
    height.value = withTiming(newExpanded ? 88 + contentHeight.value : 88, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };
  
  // Measure content height
  const onContentLayout = (event) => {
    if (contentHeight.value === 0) {
      contentHeight.value = event.nativeEvent.layout.height;
      if (expanded) {
        height.value = withTiming(88 + event.nativeEvent.layout.height, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    }
  };
  
  // Animated styles
  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotateZ.value}deg` }],
    };
  });
  
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });
  
  // Handle confirmation dialog
  const handleConfirm = () => {
    setShowConfirmation(false);
    if (confirmationType === 'save') {
      if (hasChanges) {
        saveChanges();
      } else {
        setEditMode(false);
      }
      setExpanded(false);
    } else {
      resetChanges();
      setExpanded(false);
    }
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
  };
  
  // Handle edit button press
  const handleEditPress = () => {
    setEditMode(!editMode);
    if (!expanded) {
      setExpanded(true);
      rotateZ.value = withTiming(180, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      height.value = withTiming(88 + contentHeight.value, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  return (
    <>
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: colors.card,
            borderLeftColor: hasAlert ? colors.error.main : colors.success.main,
          },
          containerStyle
        ]}
      >
        {/* Header section */}
        <TouchableOpacity 
          style={styles.header}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              {/* Use the appropriate icon from the sensor info */}
              {hasAlert ? (
                <AlertTriangle size={24} color={colors.error.main} />
              ) : (
                <View style={[styles.statusDot, { backgroundColor: colors.success.main }]} />
              )}
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {sensorInfo.name}
              </Text>
              <Text style={[styles.subtitle, { color: colors.neutral[600] }]}>
                Range: {threshold.min_value} - {threshold.max_value} {sensorInfo.unit}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <Edit size={18} color={colors.primary.main} />
            </TouchableOpacity>
            
            <Animated.View style={chevronStyle}>
              <ChevronDown size={24} color={colors.neutral[500]} />
            </Animated.View>
          </View>
        </TouchableOpacity>
        
        {/* Expanded content */}
        {expanded && (
          <View style={styles.content} onLayout={onContentLayout}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.neutral[600] }]}>
                  Status
                </Text>
                <View style={styles.statusContainer}>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { backgroundColor: hasAlert ? colors.error.main : colors.success.main }
                    ]} 
                  />
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {hasAlert ? 'Alert' : 'Normal'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.neutral[600] }]}>
                  Last Modified
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {lastModified.toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.neutral[600] }]}>
                  Alerts
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {hasAlert ? 'Active' : 'None'}
                </Text>
              </View>
            </View>
            
            {editMode ? (
              <>
                <View style={styles.sliderContainer}>
                  <ThresholdSlider
                    type={threshold.sensor_type}
                    threshold={{
                      ...threshold,
                      min_value: minValue,
                      max_value: maxValue,
                    }}
                    onChange={handleThresholdChange}
                    onChangeComplete={handleThresholdChange}
                  />
                </View>
                
                <View style={styles.actionsContainer}>
                  <Button
                    title="Reset"
                    variant="outline"
                    size="small"
                    onPress={() => {
                      setConfirmationType('reset');
                      setShowConfirmation(true);
                    }}
                    style={styles.actionButton}
                    icon={RefreshCw}
                  />
                  
                  <Button
                    title="Save Changes"
                    variant="primary"
                    size="small"
                    onPress={() => {
                      if (hasChanges) {
                        saveChanges();
                      } else {
                        setEditMode(false);
                      }
                    }}
                    isLoading={isLoading}
                    disabled={!hasChanges}
                    style={styles.actionButton}
                    icon={Save}
                  />
                </View>
              </>
            ) : (
              <View style={styles.descriptionContainer}>
                <Text style={[styles.description, { color: colors.neutral[600] }]}>
                  {sensorInfo.description}. The recommended range for {sensorInfo.name.toLowerCase()} 
                  is between {sensorInfo.defaultMin} and {sensorInfo.defaultMax} {sensorInfo.unit}.
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
      
      <ConfirmationDialog
        visible={showConfirmation}
        title={confirmationType === 'save' ? 'Unsaved Changes' : 'Reset Changes'}
        message={
          confirmationType === 'save' 
            ? 'You have unsaved changes. Would you like to save them before closing?'
            : 'This will reset all changes to the last saved values. Continue?'
        }
        confirmText={confirmationType === 'save' ? 'Save Changes' : 'Reset'}
        cancelText={confirmationType === 'save' ? 'Discard' : 'Cancel'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type={confirmationType === 'save' ? 'warning' : 'info'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    height: 88,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ThresholdCard;