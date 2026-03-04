import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

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
	const isComposing = useRef(false);
	const nodeRef = useRef<HTMLTextAreaElement | null>(null);
	// 안정적인 고유 ID (useId 대신 useRef로 생성)
	const nativeId = useRef(`mt-input-${Math.random().toString(36).slice(2, 9)}`).current;

	// 웹: 네이티브 DOM 이벤트로 한글 IME 처리
	useEffect(() => {
		if (Platform.OS !== 'web') return;

		const node = document.getElementById(nativeId) as HTMLTextAreaElement | null;
		if (!node) return;
		nodeRef.current = node;

		const handleInput = (e: Event) => {
			// 한글/CJK IME 조합 중에는 onChange 호출 생략
			if ((e as InputEvent).isComposing) return;
			onChange(node.value);
		};

		const handleCompositionStart = () => {
			isComposing.current = true;
		};

		const handleCompositionEnd = () => {
			isComposing.current = false;
			// 조합 완료 후 최종값 동기화
			onChange(node.value);
		};

		node.addEventListener('input', handleInput);
		node.addEventListener('compositionstart', handleCompositionStart);
		node.addEventListener('compositionend', handleCompositionEnd);

		return () => {
			node.removeEventListener('input', handleInput);
			node.removeEventListener('compositionstart', handleCompositionStart);
			node.removeEventListener('compositionend', handleCompositionEnd);
			nodeRef.current = null;
		};
	}, [nativeId, onChange]);

	// 웹: 부모에서 value를 직접 바꿀 때 DOM에 반영 (초기화 등)
	useEffect(() => {
		if (Platform.OS !== 'web') return;
		const node = nodeRef.current;
		if (node && !isComposing.current && node.value !== value) {
			node.value = value;
		}
	}, [value]);

	return (
		<View style={styles.container}>
			<TextInput
				// 웹: uncontrolled (defaultValue) + nativeID → React가 DOM 값을 덮어쓰지 않아 IME 정상 작동
				// 네이티브: controlled (value + onChangeText)
				{...(Platform.OS === 'web'
					? { nativeID: nativeId, defaultValue: value }
					: { value, onChangeText: onChange }
				)}
				style={styles.textInput}
				placeholder={placeholder}
				placeholderTextColor="#767676"
				multiline
				maxLength={maxLength}
				textAlignVertical="top"
				accessibilityLabel={placeholder}
				accessibilityHint={`최대 ${maxLength}자 입력 가능`}
				returnKeyType="default"
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
