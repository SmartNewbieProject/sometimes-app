import { TextInput, type TextInputProps, View, StyleSheet } from 'react-native';

interface TextAreaStyleProps {
	size?: 'sm' | 'md' | 'lg';
	status?: 'default' | 'error' | 'success';
	isDisabled?: boolean;
}

const createTextAreaStyles = (props: TextAreaStyleProps) => {
	const {
		size = 'md',
		status = 'default',
		isDisabled = false
	} = props;

	const baseStyle = {
		width: '100%',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderRadius: 8,
		padding: 8,
		borderColor: '#D1D5DB', // border-border-default
	};

	const sizeStyles = {
		sm: { minHeight: 80 },
		md: { minHeight: 120 },
		lg: { minHeight: 160 },
	};

	const statusStyles = {
		default: { borderColor: '#C4B5FD' }, // border-lightPurple
		error: { borderColor: '#F87171' }, // border-rose-400
		success: { borderColor: '#10B981' }, // border-green-500
	};

	const disabledStyles = isDisabled ? {
		opacity: 0.5,
		backgroundColor: '#F3F4F6', // bg-gray-100
	} : {};

	return StyleSheet.flatten([
		baseStyle,
		sizeStyles[size],
		statusStyles[status],
		disabledStyles
	]);
};

export interface TextAreaProps
	extends Omit<TextInputProps, 'style' | 'multiline'> {
	size?: 'sm' | 'md' | 'lg';
	status?: 'default' | 'error' | 'success';
	isDisabled?: boolean;
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
	style,
	...props
}: TextAreaProps) {
	const textAreaStyles = createTextAreaStyles({ size, status, isDisabled });

	return (
		<View style={containerClassName ? StyleSheet.flatten([{}, containerClassName]) : {}}>
			<TextInput
				style={StyleSheet.flatten([
					textAreaStyles,
					{ textAlignVertical: 'top' },
					style
				])}
				placeholderTextColor={placeholderTextColor}
				editable={!isDisabled && editable}
				multiline
				autoCapitalize="none"
				autoCorrect={false}
				{...props}
			/>
		</View>
	);
}
