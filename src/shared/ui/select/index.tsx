import { cn } from '@/src/shared/libs/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Text } from '../text';
import colors from '../../constants/colors';
import { ScrollView } from 'react-native-gesture-handler';
import i18n from '@/src/shared/libs/i18n';


const select = cva(
  'w-full flex flex-col justify-center bg-transparent border-b border-[#E7E9EC]', 
  {
    variants: {
      size: {
        sm: 'h-10 text-sm',
        md: 'h-12 text-md',
        lg: 'h-14 text-lg',
      },
      status: {
        default: 'border-lightPurple',
        error: 'border-rose-400',
        success: 'border-green-500',
      },
      isDisabled: {
        true: 'opacity-50 bg-gray-100',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'default',
    },
  }
);

interface Option {
  label: string;
  value: string;
}

export interface SelectProps extends VariantProps<typeof select> {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  width?: number;
}

export function Select({
  value,
  onChange,
  options,
  size,
  status,
  isDisabled,
  placeholder = i18n.t("shareds.select.select.placeholder"),
  className,
  width,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const modalWidth = 300;

  return (
    <View className={cn(className)} style={width ? { width } : undefined}>
      <TouchableOpacity 
        onPress={() => !isDisabled && setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View className={select({ size, status, isDisabled })}>
          <Text 
            size={size} 
            textColor={value ? 'black' : 'pale-purple'}
            className="py-2"
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
        <View className="flex-1 bg-black/30 justify-center items-center">
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
                className={cn(
                  "py-3 px-4",
                  value === option.value && "bg-lightPurple"
                )}
                style={{
                  width: '100%',
                }}
              >
                <Text
                  textColor={value === option.value ? 'purple' : 'black'}
                  className="text-[18px]"
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
  modalContainer: {
    backgroundColor: 'white',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.lightPurple,
    borderRadius: 10,
    maxHeight: 500,
    position: 'absolute',
    top: 150,
  },
  modalContent: {
    flexGrow: 1,
  },
});