import React, { useCallback, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SendChatIcon from '@assets/icons/send-chat.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

interface SupportChatInputProps {
	onSend: (message: string) => void;
	onTyping?: (isTyping: boolean) => void;
	disabled?: boolean;
}

function SupportChatInput({ onSend, onTyping, disabled = false }: SupportChatInputProps) {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const [message, setMessage] = useState('');
	const keyboard = useAnimatedKeyboard();

	const animatedKeyboardStyles = useAnimatedStyle(() => ({
		paddingBottom: Platform.OS === 'android' && keyboard.height.value > 0 ? 16 : 0,
	}));

	const handleChangeText = useCallback(
		(text: string) => {
			setMessage(text);
			onTyping?.(text.length > 0);
		},
		[onTyping],
	);

	const handleSend = useCallback(() => {
		const trimmed = message.trim();
		if (trimmed && !disabled) {
			onSend(trimmed);
			setMessage('');
			onTyping?.(false);
			Keyboard.dismiss();
		}
	}, [message, disabled, onSend, onTyping]);

	return (
		<Animated.View
			style={[
				styles.container,
				{ paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12 },
				animatedKeyboardStyles,
			]}
		>
			<View style={styles.inputContainer}>
				<TextInput
					multiline
					value={message}
					editable={!disabled}
					onChangeText={handleChangeText}
					style={styles.textInput}
					placeholder={t('features.support-chat.input.placeholder')}
					placeholderTextColor={semanticColors.text.disabled}
					numberOfLines={3}
				/>
				{message.trim() !== '' && (
					<Pressable onPress={handleSend} style={styles.sendButton} disabled={disabled}>
						<SendChatIcon width={32} height={32} />
					</Pressable>
				)}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		minHeight: 70,
		alignItems: 'center',
		backgroundColor: semanticColors.surface.background,
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	inputContainer: {
		flex: 1,
		minHeight: 47,
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 24,
		backgroundColor: semanticColors.surface.surface,
		paddingHorizontal: 8,
	},
	textInput: {
		flex: 1,
		alignSelf: 'center',
		fontSize: 16,
		lineHeight: 18,
		marginVertical: 14,
		letterSpacing: -0.042,
		paddingHorizontal: 10,
		...(Platform.OS === 'android' ? { textAlignVertical: 'center' } : { paddingVertical: 0 }),
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
	},
	sendButton: {
		width: 32,
		marginVertical: 8,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 9999,
		alignSelf: 'flex-end',
		backgroundColor: semanticColors.brand.primary,
	},
});

export default SupportChatInput;
