import { useController, Control } from 'react-hook-form';
import { Input, type InputProps } from '@/src/shared/ui';

interface FormInputProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  control: Control<any>;
  name: string;
  rules?: Record<string, any>;
}

export function FormInput({
  control,
  name,
  rules,
  ...props
}: FormInputProps) {
  const {
    field: { value, onChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules
  });

  return (
    <Input
      value={value}
      onChangeText={onChange}
      status={error ? "error" : "default"}
      {...props}
    />
  );
}
