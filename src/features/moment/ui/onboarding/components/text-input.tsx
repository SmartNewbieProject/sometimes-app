import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface OnboardingTextInputProps {
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	maxLength?: number;
}

export const OnboardingTextInput = ({
	value,
	onChange,
	placeholder = '답변을 입력해주세요',
	maxLength = 500,
}: OnboardingTextInputProps) => {
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.textInput}
				value={value}
				onChangeText={onChange}
				placeholder={placeholder}
				placeholderTextColor="#999999"
				multiline
				maxLength={maxLength}
				textAlignVertical="top"
			/>
			<View style={styles.charCount}>
				<Text size="12" weight="normal" textColor="gray">
					{value.length}/{maxLength}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: '#E5E5E5',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
		minHeight: 160,
	},
	textInput: {
		flex: 1,
		fontSize: 15,
		lineHeight: 24,
		color: colors.black,
		minHeight: 120,
	},
	charCount: {
		alignItems: 'flex-end',
		paddingTop: 8,
	},
});
