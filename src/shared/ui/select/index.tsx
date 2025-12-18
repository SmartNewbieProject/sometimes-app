import colors from '../../constants/colors';
import { semanticColors } from '../../constants/semantic-colors';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { Text } from '../text';
import { ScrollView } from 'react-native-gesture-handler';
import i18n from '@/src/shared/libs/i18n';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectStatus = 'default' | 'error' | 'success';

interface Option {
  label: string;
  value: string;
}

export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string; // 호환성 유지 (무시됨)
  width?: number;
  size?: SelectSize;
  status?: SelectStatus;
  isDisabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  size = 'md',
  status = 'default',
  isDisabled = false,
  placeholder = i18n.t("shareds.select.select.placeholder"),
  className, // 무시됨
  width,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const modalWidth = 320;

  const selectContainerStyle = [
    styles.selectContainer,
    sizeStyles[size],
    statusStyles[status],
    isDisabled && styles.disabled,
  ];

  return (
    <View style={width ? { width } : styles.wrapper}>
      <TouchableOpacity
        onPress={() => !isDisabled && setIsOpen(!isOpen)}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        <View style={selectContainerStyle}>
          <Text
            size="md"
            weight={value ? "medium" : "normal"}
            textColor={value ? 'primary' : 'disabled'}
            style={styles.selectText}
          >
            {selectedOption?.label || placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContainer, { width: modalWidth }]}>
            <View style={styles.modalHeader}>
              <Text size="lg" weight="bold" textColor="primary" style={styles.modalTitle}>
                {placeholder}
              </Text>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      size="lg"
                      weight={isSelected ? "semibold" : "normal"}
                      textColor="primary"
                      style={styles.optionText}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  selectContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderRadius: 12,
  },
  selectText: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: semanticColors.surface.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    maxHeight: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  modalTitle: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  optionItem: {
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 14,
    justifyContent: 'center',
  },
  optionItemSelected: {
    backgroundColor: semanticColors.surface.tertiary,
  },
  optionText: {
    flex: 1,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    minHeight: 40,
  },
  md: {
    minHeight: 48,
  },
  lg: {
    minHeight: 56,
  },
});

const statusStyles = StyleSheet.create({
  default: {
    borderColor: semanticColors.border.default,
  },
  error: {
    borderColor: semanticColors.state.error,
  },
  success: {
    borderColor: semanticColors.state.success,
  },
});
