import { LabelInput } from '@/src/widgets/label-input';
import type { LabelInputProps } from '@/src/widgets/label-input';
import { type Control, useController } from 'react-hook-form';

interface FormLabelInputProps extends Omit<LabelInputProps, 'value' | 'onChangeText' | 'error'> {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	control: Control<any>;
	name: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	rules?: Record<string, any>;
}

export function FormLabelInput({ control, name, rules, ...props }: FormLabelInputProps) {
	const {
		field: { value, onChange, onBlur },
		fieldState: { error },
	} = useController({
		name,
		control,
		rules,
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
