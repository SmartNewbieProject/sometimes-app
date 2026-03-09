import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

	// 네이티브: 로컬 state로 IME 조합 보호 (부모 리렌더로 인한 조합 끊김 방지)
	const [localValue, setLocalValue] = useState(value);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// 부모 value가 외부에서 변경된 경우 (스텝 이동 등) 로컬 동기화
	useEffect(() => {
		if (Platform.OS === 'web') return;
		setLocalValue(value);
	}, [value]);

	const handleNativeChangeText = useCallback((text: string) => {
		setLocalValue(text);
		onChangeRef.current(text);
	}, []);

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

	const displayValue = Platform.OS === 'web' ? value : localValue;

	return (
		<View style={styles.container}>
			<TextInput
				// 웹: uncontrolled (defaultValue) + nativeID → React가 DOM 값을 덮어쓰지 않아 IME 정상 작동
				// 네이티브: 로컬 state 기반 controlled → 부모 store 리렌더가 IME 조합을 끊지 않음
				{...(Platform.OS === 'web'
					? { nativeID: nativeId, defaultValue: value }
					: { value: localValue, onChangeText: handleNativeChangeText }
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
					{displayValue.length}/{maxLength}
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
