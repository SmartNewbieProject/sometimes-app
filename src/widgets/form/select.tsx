import { Select as BaseSelect } from '@/src/shared/ui';
import type { SelectProps } from '@/src/shared/ui/select';
import { type FieldValues, type UseControllerProps, useController } from 'react-hook-form';

interface Option {
	label: string;
	value: string;
}

interface FormSelectProps<T extends FieldValues>
	extends UseControllerProps<T>,
		Omit<SelectProps, 'status'> {
	options: Option[];
	placeholder?: string;
	className?: string;
}

export function FormSelect<T extends FieldValues>({
	name,
	control,
	rules,
	options,
	size,
	isDisabled,
	placeholder,
	className,
}: FormSelectProps<T>) {
	const {
		field: { value, onChange },
		fieldState: { error },
	} = useController<T>({
		name,
		control,
		rules,
	});

	return (
		<BaseSelect
			value={value}
			onChange={onChange}
			options={options}
			size={size}
			status={error ? 'error' : 'default'}
			isDisabled={isDisabled}
			placeholder={placeholder}
			className={className}
		/>
	);
}
