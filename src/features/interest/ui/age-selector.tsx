import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from "@/src/shared/ui";
import { cn } from '@/src/shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import type { AgeOption, AgeOptionData } from '../types';

// const ageOptions: AgeOptionData[] = [
//   {
//     value: 'SAME_AGE',
//     label: '동갑',
//     image: require('@assets/images/age/same.png'),
//   },
//   {
//     value: 'YOUNGER',
//     label: '연하',
//     image: require('@assets/images/age/under.png'),
//   },
//   {
//     value: 'OLDER',
//     label: '연상',
//     image: require('@assets/images/age/high.png'),
//   },
//   {
//     value: 'NO_PREFERENCE',
//     label: '상관없음',
//     image: require('@assets/images/age/nothing.png'),
//   },
// ];

const ageSelector = cva('flex flex-row w-full justify-center flex-wrap gap-4', {
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
  options: AgeOptionData[];
  onChange: (value: AgeOption) => void;
  className?: string;
}

export function AgeSelector({
  value,
  onChange,
  size,
  options,
  className,
}: AgeSelectorProps) {
  return (
    <View
      className={cn(ageSelector({ size }), className)}
      style={{
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      {options.map((option) => (
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
        'rounded-[20px] overflow-hidden border-2 min-w-[128px] min-h-[128px] flex flex-row items-center',
        isSelected ? 'border-primaryPurple' : 'border-[#E2D5FF]',
      )}
      style={{
        width: 128,
        height: 128,
      }}
    >
      <View className="relative w-full h-full flex flex-col justify-center items-center">
        <Image
          source={option.image}
          style={{ width: 81, height: 81, aspectRatio: 1 }}
          resizeMode="cover"
        />
        <Text variant="primary" size="md" weight="semibold">
          {option.label}
        </Text>

        <View className={cn(
          "absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg",
          isSelected ? 'bg-primaryPurple' : 'bg-[#E2D5FF]',
        )}>
          <Text size="sm" textColor="white">
            선택
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export interface FormAgeSelectorProps extends Omit<AgeSelectorProps, 'value' | 'onChange'> {
  name: string;
  options: AgeOptionData[];
  control: any;
  rules?: any;
}

export function FormAgeSelector({
  name,
  control,
  rules,
  size,
  className,
  options,
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
      options={options}
    />
  );
}
