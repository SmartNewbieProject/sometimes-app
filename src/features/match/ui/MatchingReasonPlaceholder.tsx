import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

const TYPING_SPEED_MS = 80;
const LINE_DELAY_MS = 600;
const RESET_DELAY_MS = 2000;
const BLINK_DURATION_MS = 500;

// ─── 타이핑 훅 ────────────────────────────────────────────
function useTypingEffect(lines: string[]) {
	const [completedLines, setCompletedLines] = useState<string[]>([]);
	const [currentText, setCurrentText] = useState('');
	const [lineIndex, setLineIndex] = useState(0);
	const [charIndex, setCharIndex] = useState(0);

	useEffect(() => {
		if (lines.length === 0) return;

		if (lineIndex >= lines.length) {
			const resetTimer = setTimeout(() => {
				setCompletedLines([]);
				setCurrentText('');
				setLineIndex(0);
				setCharIndex(0);
			}, RESET_DELAY_MS);
			return () => clearTimeout(resetTimer);
		}

		const currentLine = lines[lineIndex];

		if (charIndex < currentLine.length) {
			const timer = setTimeout(() => {
				setCurrentText(currentLine.slice(0, charIndex + 1));
				setCharIndex((prev) => prev + 1);
			}, TYPING_SPEED_MS);
			return () => clearTimeout(timer);
		}

		const lineCompleteTimer = setTimeout(() => {
			setCompletedLines((prev) => [...prev, currentLine]);
			setCurrentText('');
			setLineIndex((prev) => prev + 1);
			setCharIndex(0);
		}, LINE_DELAY_MS);
		return () => clearTimeout(lineCompleteTimer);
	}, [lines, lineIndex, charIndex]);

	return { completedLines, currentText, isTyping: lineIndex < lines.length };
}

// ─── Web 커서 (RN Animated) ───────────────────────────────
function PenCursorWeb() {
	const opacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: BLINK_DURATION_MS,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1.0,
					duration: BLINK_DURATION_MS,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	return (
		<Animated.View style={{ opacity }}>
			<Feather name="edit-3" size={16} color={semanticColors.brand.primary} />
		</Animated.View>
	);
}

// ─── Native 커서 (Reanimated) ────────────────────────────
let PenCursorNative: React.ComponentType | null = null;

if (Platform.OS !== 'web') {
	const Reanimated = require('react-native-reanimated');
	const {
		useSharedValue,
		useAnimatedStyle,
		withRepeat,
		withTiming,
		Easing: ReanimatedEasing,
	} = Reanimated;

	PenCursorNative = function PenCursorNativeImpl() {
		const opacity = useSharedValue(1);

		useEffect(() => {
			opacity.value = withRepeat(
				withTiming(0.3, {
					duration: BLINK_DURATION_MS,
					easing: ReanimatedEasing.linear,
				}),
				-1,
				true,
			);
		}, [opacity]);

		const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

		return (
			<Reanimated.default.View style={animatedStyle}>
				<Feather name="edit-3" size={16} color={semanticColors.brand.primary} />
			</Reanimated.default.View>
		);
	};
}

function PenCursor() {
	if (Platform.OS !== 'web' && PenCursorNative) {
		return <PenCursorNative />;
	}
	return <PenCursorWeb />;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export const MatchingReasonPlaceholder = () => {
	const { t } = useTranslation();

	const lines = [
		t('features.match.ui.matching_reason_placeholder.typing_line_1'),
		t('features.match.ui.matching_reason_placeholder.typing_line_2'),
		t('features.match.ui.matching_reason_placeholder.typing_line_3'),
	];

	const { completedLines, currentText, isTyping } = useTypingEffect(lines);

	const noteLineCount = 6;

	return (
		<View style={styles.creamSection}>
			{/* 섹션 헤더 */}
			<View style={styles.headerRow}>
				<Text style={styles.sectionTitle}>
					✨ {t('features.match.ui.matching_reason_placeholder.title')}
				</Text>
				<View style={styles.writingBadge}>
					<Text style={styles.writingBadgeText}>작성 중</Text>
				</View>
			</View>

			{/* 편지지 영역 (크림 배경 안에 노트 스타일) */}
			<View style={styles.letterArea}>
				{/* 왼쪽 빨간 세로선 */}
				<View style={styles.redLine} />

				{/* 배경 노트 줄 */}
				{Array.from({ length: noteLineCount }).map((_, i) => (
					<View
						// biome-ignore lint/suspicious/noArrayIndexKey: 고정 배경 요소
						key={i}
						style={[styles.noteLine, { top: i * 32 }]}
					/>
				))}

				{/* 타이핑 영역 */}
				<View style={styles.typingArea}>
					{completedLines.map((line, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: 완료된 줄은 순서 고정
						<Text key={i} style={styles.typingText} textColor="primary">
							{line}
						</Text>
					))}

					{isTyping && (
						<View style={styles.currentLine}>
							<Text style={styles.typingText} textColor="primary">
								{currentText}
							</Text>
							<PenCursor />
						</View>
					)}
				</View>
			</View>

			{/* 하단 안내 */}
			<View style={styles.bottomHint}>
				<Text style={styles.hintText} textColor="muted">
					{t('features.match.ui.matching_reason_placeholder.hint')}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	creamSection: {
		backgroundColor: '#fff',
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 0,
		borderBottomWidth: 1,
		borderBottomColor: '#efefef',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: '600',
		color: '#7A4AE2',
	},
	writingBadge: {
		backgroundColor: '#FFF0D6',
		borderWidth: 1,
		borderColor: '#F0C88A',
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	writingBadgeText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#B9945A',
	},
	letterArea: {
		minHeight: 160,
		overflow: 'hidden',
		position: 'relative',
	},
	redLine: {
		position: 'absolute',
		left: 36,
		top: 0,
		bottom: 0,
		width: 1.5,
		backgroundColor: '#FF6B6B40',
		zIndex: 1,
	},
	noteLine: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: `${semanticColors.brand.primary}1F`,
	},
	typingArea: {
		paddingTop: 12,
		paddingLeft: 52,
		paddingRight: 12,
		paddingBottom: 16,
		gap: 8,
		minHeight: 140,
	},
	typingText: {
		fontSize: 15,
		lineHeight: 24,
		fontStyle: 'italic',
	},
	currentLine: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	bottomHint: {
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: `${semanticColors.brand.primary}15`,
		alignItems: 'center',
	},
	hintText: {
		fontSize: 11,
	},
});
