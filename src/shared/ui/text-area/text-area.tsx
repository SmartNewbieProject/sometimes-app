import { TextInput, type TextInputProps, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

type SizeType = 'sm' | 'md' | 'lg';
type StatusType = 'default' | 'error' | 'success';

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
	size?: SizeType;
	status?: StatusType;
	isDisabled?: boolean;
	style?: StyleProp<ViewStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

export function TextArea({
	size = 'md',
	status = 'default',
	isDisabled,
	style,
	containerStyle,
	placeholderTextColor = '#9CA3AF',
	editable = true,
	...props
}: TextAreaProps) {
	const getSizeStyle = () => {
		switch (size) {
			case 'sm': return styles.sizeSm;
			case 'lg': return styles.sizeLg;
			default: return styles.sizeMd;
		}
	};

	const getStatusStyle = () => {
		switch (status) {
			case 'error': return styles.statusError;
			case 'success': return styles.statusSuccess;
			default: return styles.statusDefault;
		}
	};

	return (
		<View style={containerStyle}>
			<TextInput
				placeholderTextColor={placeholderTextColor}
				editable={!isDisabled && editable}
				multiline
				style={[
					styles.textArea,
					getSizeStyle(),
					getStatusStyle(),
					isDisabled && styles.disabled,
					style,
				]}
				autoCapitalize="none"
				autoCorrect={false}
				{...props}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	textArea: {
		width: '100%',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderRadius: 8,
		padding: 8,
		textAlignVertical: 'top',
	},
	sizeSm: {
		minHeight: 80,
		fontSize: 12,
	},
	sizeMd: {
		minHeight: 120,
		fontSize: 14,
	},
	sizeLg: {
		minHeight: 160,
		fontSize: 16,
	},
	statusDefault: {
		borderColor: semanticColors.border.default,
	},
	statusError: {
		borderColor: '#FB7185',
	},
	statusSuccess: {
		borderColor: '#22C55E',
	},
	disabled: {
		opacity: 0.5,
		backgroundColor: '#F3F4F6',
	},
});
