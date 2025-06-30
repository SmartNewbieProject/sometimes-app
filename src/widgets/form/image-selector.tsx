import { UseControllerProps } from 'react-hook-form';
import { pickImage, renderImage, renderPlaceholder } from '@/src/shared/ui/image-selector';
import { FormContentSelector } from './content-selector';
import type { VariantProps } from 'class-variance-authority';
import { contentSelector } from '@/src/shared/ui/content-selector';

interface FormImageSelectorProps extends UseControllerProps, VariantProps<typeof contentSelector> {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  actionLabel?: string;
}

export function FormImageSelector({
  name,
  control,
  rules,
  className,
  size,
  actionLabel,
}: FormImageSelectorProps) {
  return (
    <FormContentSelector
      name={name}
      control={control}
      rules={rules}
      size={size}
      className={className}
      actionLabel={actionLabel}
      onPress={pickImage}
      renderContent={renderImage}
      renderPlaceholder={renderPlaceholder}
    />
  );
}
