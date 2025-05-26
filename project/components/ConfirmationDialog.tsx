import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Button from './Button';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'error';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  
  // Animation styles
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const dialogStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });
  
  // Handle showing the dialog
  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);
  
  // Get icon and color based on type
  const getTypeProps = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color={colors.warning.main} />,
          color: colors.warning.main,
        };
      case 'error':
        return {
          icon: <AlertCircle size={24} color={colors.error.main} />,
          color: colors.error.main,
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} color={colors.primary.main} />,
          color: colors.primary.main,
        };
    }
  };
  
  const { icon, color } = getTypeProps();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.dialog, 
                { backgroundColor: colors.card },
                dialogStyle
              ]}
            >
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  {icon}
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onCancel}
                >
                  <X size={20} color={colors.neutral[500]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Text style={[styles.message, { color: colors.neutral[700] }]}>
                  {message}
                </Text>
              </View>
              
              <View style={styles.actions}>
                <Button
                  title={cancelText}
                  variant="outline"
                  size="small"
                  onPress={onCancel}
                  style={styles.cancelButton}
                />
                
                <Button
                  title={confirmText}
                  variant={type === 'error' ? 'secondary' : 'primary'}
                  size="small"
                  onPress={onConfirm}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    marginRight: 8,
  },
});

export default ConfirmationDialog;