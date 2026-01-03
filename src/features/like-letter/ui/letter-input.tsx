import colors from '@/src/shared/constants/colors';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/shared/ui';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import {
	countGraphemes,
	truncateToGraphemes,
	validateLetter,
	highlightContactInfo,
	MAX_LETTER_LENGTH,
} from '../utils/letter-validator';

type LetterInputProps = {
	value: string;
	onChangeText: (text: string) => void;
	onValidationChange?: (isValid: boolean, errors: string[]) => void;
	placeholder?: string;
};

export function LetterInput({
	value,
	onChangeText,
	onValidationChange,
	placeholder,
}: LetterInputProps) {
	const { t } = useTranslation();
	const [isFocused, setIsFocused] = useState(false);
	const defaultPlaceholder = placeholder ?? t('ui.여기에_편지를_입력하세요');
	const graphemeCount = countGraphemes(value);
	const validation = validateLetter(value);

	const handleChangeText = useCallback(
		(text: string) => {
			const count = countGraphemes(text);

			if (count > MAX_LETTER_LENGTH) {
				const truncated = truncateToGraphemes(text, MAX_LETTER_LENGTH);
				onChangeText(truncated);
			} else {
				onChangeText(text);
			}

			const newValidation = validateLetter(text);
			onValidationChange?.(newValidation.isValid, newValidation.errorKeys);
		},
		[onChangeText, onValidationChange],
	);

	const renderHighlightedText = () => {
		if (!validation.hasContactInfo) {
			return null;
		}

		const segments = highlightContactInfo(value);
		return (
			<View style={styles.highlightOverlay} pointerEvents="none">
				<Text size="15" style={styles.overlayText}>
					{segments.map((segment, index) => (
						<Text
							key={index}
							size="15"
							style={segment.isHighlighted ? styles.highlightedText : styles.normalText}
						>
							{segment.text}
						</Text>
					))}
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.inputContainer,
					isFocused && styles.inputContainerFocused,
					!validation.isValid && value.length > 0 && styles.inputContainerError,
				]}
			>
				<TextInput
					style={styles.textInput}
					value={value}
					onChangeText={handleChangeText}
					placeholder={defaultPlaceholder}
					placeholderTextColor="#939598"
					multiline
					textAlignVertical="top"
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					maxLength={MAX_LETTER_LENGTH * 4}
				/>
				{renderHighlightedText()}
				<View style={styles.counterContainer}>
					<Text
						size="13"
						weight="medium"
						style={[styles.counter, graphemeCount > MAX_LETTER_LENGTH ? styles.counterError : {}]}
					>
						{graphemeCount}/{MAX_LETTER_LENGTH}
					</Text>
				</View>
			</View>

			{!validation.isValid && value.length > 0 && (
				<View style={styles.errorContainer}>
					<Text size="12" style={styles.errorIcon}>
						⚠
					</Text>
					<Text size="12" style={styles.errorText}>
						{t(validation.errorKeys[0])}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	inputContainer: {
		backgroundColor: colors.white,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E2D6FF',
		minHeight: 172,
		padding: 15,
		position: 'relative',
	},
	inputContainerFocused: {
		borderColor: colors.primaryPurple,
		borderWidth: 2,
	},
	inputContainerError: {
		borderColor: colors.state.error,
	},
	textInput: {
		flex: 1,
		fontSize: 15,
		fontFamily: 'Pretendard',
		color: colors.black,
		lineHeight: 31,
		minHeight: 120,
		padding: 0,
	},
	highlightOverlay: {
		position: 'absolute',
		top: 15,
		left: 15,
		right: 15,
		pointerEvents: 'none',
	},
	overlayText: {
		lineHeight: 31,
	},
	normalText: {
		color: 'transparent',
	},
	highlightedText: {
		color: colors.state.error,
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
	},
	counterContainer: {
		position: 'absolute',
		bottom: 15,
		right: 15,
	},
	counter: {
		color: '#A892D7',
	},
	counterError: {
		color: colors.state.error,
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		paddingHorizontal: 4,
		gap: 4,
	},
	errorIcon: {
		color: colors.state.error,
	},
	errorText: {
		color: colors.state.error,
	},
});
