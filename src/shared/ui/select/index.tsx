import { cn } from '@/src/shared/libs/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import { useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { Text } from '../text';

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
  placeholder = '선택해주세요',
  className,
  width,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

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
          <View 
            className="bg-white border border-lightPurple rounded-lg max-h-[200px] overflow-scroll"
            style={{ 
              width: 300,
              maxWidth: '90%',
              position: 'absolute',
              top: 150,
            }}
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
              >
                <Text
                  size={size}
                  textColor={value === option.value ? 'purple' : 'black'}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
