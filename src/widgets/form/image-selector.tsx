import { useController, UseControllerProps } from 'react-hook-form';
import { ImageSelector as BaseImageSelector, ImageSelector } from '@/src/shared/ui';
import type { VariantProps } from 'class-variance-authority';

interface FormImageSelectorProps extends UseControllerProps, VariantProps<typeof ImageSelector> {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FormImageSelector({
  name,
  control,
  rules,
  className,
  size,
}: FormImageSelectorProps) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <BaseImageSelector
      value={value}
      onChange={onChange}
      size={size}
      className={className}
    />
  );
} 