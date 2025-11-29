import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Text } from '../text';
import { ScrollView } from 'react-native-gesture-handler';
import { semanticColors } from '../../constants/colors';
import { useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectStyleProps {
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success';
  isDisabled?: boolean;
}

const createSelectStyles = (props: SelectStyleProps) => {
  const {
    size = 'md',
    status = 'default',
    isDisabled = false
  } = props;

  const baseStyle = {
    width: '100%',
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: '#D1D5DB', // border-border-default
  };

  const sizeStyles = {
    sm: { minHeight: 40 },
    md: { minHeight: 48 },
    lg: { minHeight: 56 },
  };

  const statusStyles = {
    default: { borderColor: '#C4B5FD' }, // border-lightPurple
    error: { borderColor: '#F87171' }, // border-rose-400
    success: { borderColor: '#10B981' }, // border-green-500
  };

  const disabledStyles = isDisabled ? {
    opacity: 0.5,
    backgroundColor: '#F3F4F6', // bg-gray-100
  } : {};

  return StyleSheet.flatten([
    baseStyle,
    sizeStyles[size],
    statusStyles[status],
    disabledStyles
  ]);
};

export interface SelectProps extends SelectStyleProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  width?: number;
}

export function Select({
  value,
  onChange,
  options,
  size = 'md',
  status = 'default',
  isDisabled = false,
  placeholder = '선택해주세요',
  width,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const modalWidth = 300;
  const selectStyles = createSelectStyles({ size, status, isDisabled });

  return (
    <View style={width ? { width } : {}}>
      <TouchableOpacity
        onPress={() => !isDisabled && setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={selectStyles}>
          <Text
            size={size}
            textColor={value ? 'black' : 'pale-purple'}
            style={{ paddingVertical: 8 }}
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
        <View style={styles.overlay}>
          <ScrollView
            style={[styles.modalContainer, { width: modalWidth }]}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption
                ]}
              >
                <Text
                  textColor={value === option.value ? 'purple' : 'black'}
                  style={{ fontSize: 18 }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // bg-surface-inverse/30
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#C4B5FD', // colors.lightPurple
    borderRadius: 10,
    maxHeight: 500,
    position: 'absolute',
    top: 150,
  },
  modalContent: {
    flexGrow: 1,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  selectedOption: {
    backgroundColor: '#C4B5FD', // bg-lightPurple
  },
});