import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { ReadingType } from '../types/reading';

interface TypePickerProps {
  value: ReadingType;
  onChange: (type: ReadingType) => void;
  label?: string;
}

const READING_TYPES: ReadingType[] = ['Fasting', 'Post-meal', 'Random'];

const TYPE_DESCRIPTIONS: Record<ReadingType, string> = {
  Fasting: 'Before eating (8+ hours)',
  'Post-meal': '1-2 hours after eating',
  Random: 'Any time of day',
};

const TYPE_ICONS: Record<ReadingType, string> = {
  Fasting: '🌅',
  'Post-meal': '🍽️',
  Random: '⏰',
};

export default function TypePicker({ value, onChange, label = 'Reading Type' }: TypePickerProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelect = (type: ReadingType) => {
    onChange(type);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectedValue}>
          <Text style={styles.icon}>{TYPE_ICONS[value]}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.selectedText}>{value}</Text>
            <Text style={styles.description}>{TYPE_DESCRIPTIONS[value]}</Text>
          </View>
        </View>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Reading Type</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {READING_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  value === type && styles.selectedOption,
                ]}
                onPress={() => handleSelect(type)}
              >
                <Text style={styles.optionIcon}>{TYPE_ICONS[type]}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    value === type && styles.selectedOptionText,
                  ]}>
                    {type}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {TYPE_DESCRIPTIONS[type]}
                  </Text>
                </View>
                {value === type && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selector: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

