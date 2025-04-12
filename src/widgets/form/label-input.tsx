import { useController, Control } from 'react-hook-form';
import { LabelInput } from '@/src/widgets/label-input';
import type { LabelInputProps } from '@/src/widgets/label-input';

interface FormLabelInputProps extends Omit<LabelInputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<any>;
  name: string;
  rules?: Record<string, any>;
}

export function FormLabelInput({
  control,
  name,
  rules,
  ...props
}: FormLabelInputProps) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules
  });

  return (
    <LabelInput
      value={value}
      onChangeText={onChange}
      error={error?.message}
      onBlur={onBlur}
      {...props}
    />
  );
}
