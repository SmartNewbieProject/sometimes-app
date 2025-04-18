import { ReactNode, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../text';
import { cn } from '@/src/shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export const contentSelector = cva('rounded-[20px] relative overflow-hidden border-2', {
  variants: {
    size: {
      sm: 'w-[120px] h-[120px]',
      md: 'w-[160px] h-[160px]',
      lg: 'w-[200px] h-[200px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface ContentSelectorProps extends VariantProps<typeof contentSelector> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  onPress?: () => Promise<string | null>;
  renderContent?: (value: string | null) => ReactNode;
  renderPlaceholder?: () => ReactNode;
  actionLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function ContentSelector({
  value,
  onChange,
  size,
  className,
  onPress,
  renderContent,
  renderPlaceholder,
  actionLabel = '선택',
  activeColor = 'primaryPurple',
  inactiveColor = '#E2D5FF',
}: ContentSelectorProps) {
  const [_value, setValue] = useState<string | null>(value ?? null);

  const handlePress = async () => {
    if (onPress) {
      const result = await onPress();
      if (result) {
        setValue(result);
        onChange(result);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View className={cn(
        contentSelector({ size }),
        !!_value ? `border-${activeColor}` : `border-[${inactiveColor}]`,
        className)}>
        <View className={cn(
          "absolute top-0 right-0 z-10 px-2.5 py-1 rounded-bl-lg text-white",
          !!_value ? `bg-${activeColor}` : `bg-[${inactiveColor}]`,
        )}>
          <Text size="sm" textColor="white">
            {actionLabel}
          </Text>
        </View>

        {_value && renderContent ? renderContent(_value) : null}

        {!_value && renderPlaceholder ? renderPlaceholder() : (
          <View className="flex-1 items-center justify-center">
            <View className="w-full h-full bg-[#F3EDFF] flex justify-center items-center">
              <Text size="sm" className="text-[#9B94AB]">
                콘텐츠 추가하기
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
