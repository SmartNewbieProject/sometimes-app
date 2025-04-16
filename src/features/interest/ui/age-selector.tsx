import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from "@/src/shared/ui";
import { cn } from '@/src/shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export type AgeOption = 'same' | 'younger' | 'older' | 'any';

interface AgeOptionData {
  value: AgeOption;
  label: string;
  image: any;
}

const ageOptions: AgeOptionData[] = [
  {
    value: 'same',
    label: '동갑',
    image: require('@assets/images/age/same.png'),
  },
  {
    value: 'younger',
    label: '연하',
    image: require('@assets/images/age/under.png'),
  },
  {
    value: 'older',
    label: '연상',
    image: require('@assets/images/age/high.png'),
  },
  {
    value: 'any',
    label: '상관없음',
    image: require('@assets/images/age/nothing.png'),
  },
];

const ageSelector = cva('grid grid-cols-2 gap-4', {
  variants: {
    size: {
      sm: 'max-w-[300px]',
      md: 'max-w-[400px]',
      lg: 'max-w-[500px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface AgeSelectorProps extends VariantProps<typeof ageSelector> {
  value?: AgeOption;
  onChange: (value: AgeOption) => void;
  className?: string;
}

export function AgeSelector({
  value,
  onChange,
  size,
  className,
}: AgeSelectorProps) {
  return (
    <View className={cn(ageSelector({ size }), className)}>
      {ageOptions.map((option) => (
        <AgeCard
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

interface AgeCardProps {
  option: AgeOptionData;
  isSelected: boolean;
  onSelect: () => void;
}

function AgeCard({ option, isSelected, onSelect }: AgeCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      className={cn(
        'rounded-[20px] overflow-hidden border-2 w-full',
        isSelected ? 'border-primaryPurple' : 'border-[#E2D5FF]',
      )}
    >
      <View className="relative">
        <Image
          source={option.image}
          style={{ width: 100, height: 100, aspectRatio: 1 }}
          resizeMode="cover"
        />
        <View className={cn(
          "absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg",
          isSelected ? 'bg-primaryPurple' : 'bg-[#E2D5FF]',
        )}>
          <Text size="sm" textColor="white">
            선택
          </Text>
        </View>
        <View className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-80">
          <Text size="md" textColor="purple" className="text-center">
            {option.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export interface FormAgeSelectorProps extends Omit<AgeSelectorProps, 'value' | 'onChange'> {
  name: string;
  control: any;
  rules?: any;
}

export function FormAgeSelector({
  name,
  control,
  rules,
  size,
  className,
}: FormAgeSelectorProps) {
  const { useController } = require('react-hook-form');

  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <AgeSelector
      value={value}
      onChange={onChange}
      size={size}
      className={className}
    />
  );
}
