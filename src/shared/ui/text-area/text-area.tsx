import { type VariantProps, cva } from 'class-variance-authority';
import { TextInput, type TextInputProps, View } from 'react-native';

const textArea = cva('w-full bg-transparent border rounded-md p-2 border-[#E7E9EC]', {
	variants: {
		size: {
			sm: 'min-h-[80px] text-sm',
			md: 'min-h-[120px] text-md',
			lg: 'min-h-[160px] text-lg',
		},
		status: {
			default: 'border-lightPurple',
			error: 'border-rose-400',
			success: 'border-green-500',
		},
		isDisabled: {
			true: 'opacity-50 bg-gray-100',
		},
	},
	defaultVariants: {
		size: 'md',
		status: 'default',
	},
});

export interface TextAreaProps
	extends Omit<TextInputProps, 'style' | 'multiline'>,
		VariantProps<typeof textArea> {
	className?: string;
	containerClassName?: string;
}

export function TextArea({
	size,
	status,
	isDisabled,
	className,
	containerClassName,
	placeholderTextColor = '#9CA3AF',
	editable = true,
	...props
}: TextAreaProps) {
	return (
		<View className={containerClassName}>
			<TextInput
				className={textArea({ size, status, isDisabled, className })}
				placeholderTextColor={placeholderTextColor}
				editable={!isDisabled && editable}
				multiline
				style={{ textAlignVertical: 'top' }}
				autoCapitalize="none"
				autoCorrect={false}
				{...props}
			/>
		</View>
	);
}
