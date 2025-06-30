import { TextArea, type TextAreaProps } from '@/src/shared/ui/text-area';
import { type Control, useController } from 'react-hook-form';

interface FormTextAreaProps extends Omit<TextAreaProps, 'value' | 'onChangeText'> {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	control: Control<any>;
	name: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	rules?: Record<string, any>;
}

export function FormTextArea({ control, name, rules, ...props }: FormTextAreaProps) {
	const {
		field: { value, onChange },
		fieldState: { error },
	} = useController({
		name,
		control,
		rules,
	});

	return (
		<TextArea
			value={value}
			onChangeText={onChange}
			status={error ? 'error' : 'default'}
			{...props}
		/>
	);
}
