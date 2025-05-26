import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Get styles based on variant and size
  const getContainerStyles = (): ViewStyle => {
    let baseStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle = {
          backgroundColor: colors.primary.main,
          borderColor: colors.primary.main,
        };
        break;
      case 'secondary':
        baseStyle = {
          backgroundColor: colors.secondary.main,
          borderColor: colors.secondary.main,
        };
        break;
      case 'outline':
        baseStyle = {
          backgroundColor: 'transparent',
          borderColor: colors.primary.main,
          borderWidth: 1,
        };
        break;
      case 'text':
        baseStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle = {
          ...baseStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
        break;
      case 'medium':
        baseStyle = {
          ...baseStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
        break;
      case 'large':
        baseStyle = {
          ...baseStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
        break;
    }
    
    // Disabled styles
    if (disabled || isLoading) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.6,
      };
    }
    
    return baseStyle;
  };
  
  // Get text styles based on variant and size
  const getTextStyles = (): TextStyle => {
    let baseStyle: TextStyle = {
      fontWeight: '600',
    };
    
    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle = {
          ...baseStyle,
          color: '#FFFFFF',
        };
        break;
      case 'outline':
      case 'text':
        baseStyle = {
          ...baseStyle,
          color: colors.primary.main,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle = {
          ...baseStyle,
          fontSize: 14,
        };
        break;
      case 'medium':
        baseStyle = {
          ...baseStyle,
          fontSize: 16,
        };
        break;
      case 'large':
        baseStyle = {
          ...baseStyle,
          fontSize: 18,
        };
        break;
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.container,
        getContainerStyles(),
        style
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary.main}
        />
      ) : (
        <Text style={[
          styles.text,
          getTextStyles(),
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
});

export default Button;