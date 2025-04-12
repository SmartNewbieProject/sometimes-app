import { View } from 'react-native';
import { Text } from '@/src/shared/ui';
import { cn } from '@shared/libs/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const label = cva('flex-row items-center gap-x-1', {
  variants: {
    size: {
      sm: 'gap-x-0.5',
      md: 'gap-x-1',
      lg: 'gap-x-1.5',
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

interface LabelProps extends VariantProps<typeof label> {
  label: string;
  required?: boolean;
  className?: string;
}

export function Label({
  label: labelText,
  required = false,
  size,
  className,
}: LabelProps) {
  return (
    <View className={cn(label({ size }), className)}>
      <Text 
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} 
        weight="semibold" 
        textColor="purple"
      >
        {labelText}
      </Text>
      {required && (
        <Text size={size === 'lg' ? 'md' : 'sm'} textColor="purple">
          *
        </Text>
      )}
    </View>
  );
} 