import { Input, type InputProps } from "@/src/shared/ui";
import { type Control, useController } from "react-hook-form";

interface FormInputProps extends Omit<InputProps, "value" | "onChangeText"> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  control: Control<any>;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
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
