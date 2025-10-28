import { Select as BaseSelect } from "@/src/shared/ui";
import Radio from "@/src/shared/ui/radio";
import type { SelectProps } from "@/src/shared/ui/select";
import {
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { StyleSheet, View } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface FormRadioProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<SelectProps, "status"> {
  options: Option[];
  placeholder?: string;
  isOther?: boolean;
  otherReason?: string;
  onChangeOtherReason?: (text: string) => void;
}

export function FormRadio<T extends FieldValues>({
  name,
  control,
  rules,
  options,
  isOther,
  otherReason,
  onChangeOtherReason,
}: FormRadioProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    rules,
  });

  return (
    <View style={styles.container}>
      {options.map((item) => (
        <Radio
          option={item}
          onChange={onChange}
          value={value}
          otherReason={otherReason}
          isOther={isOther}
          onChangeOtherReason={onChangeOtherReason}
          key={item.value}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});
