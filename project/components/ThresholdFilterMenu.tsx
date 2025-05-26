import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  useColorScheme,
  Switch,
} from 'react-native';
import { Filter, RefreshCw, Check } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Button from './Button';

interface ThresholdFilterMenuProps {
  visible: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ThresholdFilterMenu: React.FC<ThresholdFilterMenuProps> = ({
  visible,
  onClose,
  onReset,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Local state for filters
  const [showAlerts, setShowAlerts] = React.useState(true);
  const [showNormal, setShowNormal] = React.useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = React.useState(false);
  const [outOfRange, setOutOfRange] = React.useState(false);
  
  // Animation values
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  
  // Animation styles
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const menuStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
  
  // Handle showing the menu
  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible]);
  
  // Handle reset
  const handleReset = () => {
    setShowAlerts(true);
    setShowNormal(true);
    setRecentlyUpdated(false);
    setOutOfRange(false);
    onReset();
    onClose();
  };
  
  // Handle apply
  const handleApply = () => {
    // Apply filters here
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Animated.View 
            style={[
              styles.menu, 
              { backgroundColor: colors.card },
              menuStyle
            ]}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Filter size={20} color={colors.primary.main} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Filter Thresholds
              </Text>
              <TouchableOpacity 
                style={[
                  styles.resetButton,
                  { borderColor: colors.neutral[300] }
                ]}
                onPress={handleReset}
              >
                <RefreshCw size={14} color={colors.neutral[600]} />
                <Text style={[styles.resetText, { color: colors.neutral[600] }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Status
              </Text>
              
              <View style={styles.optionContainer}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  Show Alerts
                </Text>
                <Switch
                  value={showAlerts}
                  onValueChange={setShowAlerts}
                  trackColor={{ 
                    false: colors.neutral[300],
                    true: colors.primary.light,
                  }}
                  thumbColor={showAlerts ? colors.primary.main : colors.neutral[100]}
                />
              </View>
              
              <View style={styles.optionContainer}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  Show Normal
                </Text>
                <Switch
                  value={showNormal}
                  onValueChange={setShowNormal}
                  trackColor={{ 
                    false: colors.neutral[300],
                    true: colors.primary.light,
                  }}
                  thumbColor={showNormal ? colors.primary.main : colors.neutral[100]}
                />
              </View>
              
              <View style={styles.divider} />
              
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Time Period
              </Text>
              
              <View style={styles.optionContainer}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  Recently Updated
                </Text>
                <Switch
                  value={recentlyUpdated}
                  onValueChange={setRecentlyUpdated}
                  trackColor={{ 
                    false: colors.neutral[300],
                    true: colors.primary.light,
                  }}
                  thumbColor={recentlyUpdated ? colors.primary.main : colors.neutral[100]}
                />
              </View>
              
              <View style={styles.divider} />
              
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Special Filters
              </Text>
              
              <View style={styles.optionContainer}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  Out of Recommended Range
                </Text>
                <Switch
                  value={outOfRange}
                  onValueChange={setOutOfRange}
                  trackColor={{ 
                    false: colors.neutral[300],
                    true: colors.primary.light,
                  }}
                  thumbColor={outOfRange ? colors.primary.main : colors.neutral[100]}
                />
              </View>
            </View>
            
            <View style={[styles.actions, { borderTopColor: colors.neutral[200] }]}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.cancelButton}
              />
              
              <Button
                title="Apply Filters"
                variant="primary"
                onPress={handleApply}
                icon={Check}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default ThresholdFilterMenu;