import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Badge, Text } from '@/src/shared/ui';
import { Gaegu_400Regular, useFonts } from '@expo-google-fonts/gaegu';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MatchingReasonCardProps {
	reasons: string[];
	keywords: string[];
	isLoading?: boolean;
}

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

// ─── Web 커서 ─────────────────────────────────────────────
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
			<Feather name="edit-3" size={14} color={semanticColors.brand.primary} />
		</Animated.View>
	);
}

// ─── Native 커서 (Reanimated) ─────────────────────────────
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
				<Feather name="edit-3" size={14} color={semanticColors.brand.primary} />
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

// ─── 타이핑 콘텐츠 ────────────────────────────────────────
function TypingContent() {
	const { t } = useTranslation();

	const lines = [
		t('features.match.ui.matching_reason_placeholder.typing_line_1'),
		t('features.match.ui.matching_reason_placeholder.typing_line_2'),
		t('features.match.ui.matching_reason_placeholder.typing_line_3'),
	];

	const { completedLines, currentText, isTyping } = useTypingEffect(lines);

	return (
		<View style={styles.typingArea}>
			{completedLines.map((line, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: 완료된 줄은 순서 고정
				<Text key={i} style={styles.reasonText}>
					{line}
				</Text>
			))}
			{isTyping && (
				<View style={styles.currentLine}>
					<Text style={styles.reasonText}>{currentText}</Text>
					<PenCursor />
				</View>
			)}
		</View>
	);
}

const NOTE_LINE_HEIGHT = 24;
const COLLAPSED_HEIGHT = NOTE_LINE_HEIGHT * 4 + 24; // 120px

// ─── 메인 컴포넌트 ────────────────────────────────────────
export const MatchingReasonCard = ({
	reasons,
	keywords,
	isLoading = false,
}: MatchingReasonCardProps) => {
	const { t } = useTranslation();
	const [areaHeight, setAreaHeight] = useState(0);
	const [titleHeight, setTitleHeight] = useState(0);
	const [expanded, setExpanded] = useState(false);
	const [contentHeight, setContentHeight] = useState(0);
	const [fontsLoaded] = useFonts({ Gaegu_400Regular });
	const floatAnim = useRef(new Animated.Value(0)).current;
	const expandAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

	const handleExpand = () => {
		setExpanded(true);
		Animated.spring(expandAnim, {
			toValue: contentHeight || COLLAPSED_HEIGHT * 3,
			tension: 40,
			friction: 9,
			useNativeDriver: false,
		}).start();
	};

	const lineCount = Math.ceil((areaHeight - titleHeight) / NOTE_LINE_HEIGHT) + 1;

	useEffect(() => {
		if (expanded || isLoading) return;
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: -5,
					duration: 900,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 900,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [expanded, isLoading, floatAnim]);

	return (
		<View style={styles.container}>
			{/* 편지지 카드 */}
			<View style={styles.noteCard}>
				{/* 편지지 헤더 장식선 */}
				<View style={styles.letterHeader}>
					<View style={styles.letterHeaderLine} />
					<Text style={styles.letterHeaderText}>✉️</Text>
					<View style={styles.letterHeaderLine} />
				</View>

				{/* 편지지 본문 */}
				<View style={styles.noteInner}>
					{/* 왼쪽 빨간 세로선 */}
					<View style={styles.redMarginLine} />

					{/* 콘텐츠 영역 */}
					<View
						style={styles.contentArea}
						onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}
					>
						{/* 편지지 배경 줄 */}
						{areaHeight > 0 &&
							Array.from({ length: lineCount }).map((_, i) => (
								<View
									// biome-ignore lint/suspicious/noArrayIndexKey: 고정 배경 요소
									key={i}
									style={[styles.noteLine, { top: titleHeight + 12 + i * NOTE_LINE_HEIGHT }]}
								/>
							))}
						{/* 카드 타이틀 */}
						<View
							style={styles.titleRow}
							onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}
						>
							<Text style={styles.cardTitle}>
								✨ {t('features.match.ui.matching_reason_placeholder.title')}
							</Text>
							{isLoading && (
								<View style={styles.writingBadge}>
									<Text style={styles.writingBadgeText}>작성 중</Text>
								</View>
							)}
						</View>

						{/* 사유 텍스트: 로딩 시 타이핑 / 완료 시 실제 데이터 */}
						{isLoading ? (
							<TypingContent />
						) : (
							<Animated.View style={[styles.reasonsClip, { height: expandAnim }]}>
								<View
									style={styles.reasonsContainer}
									onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
								>
									{reasons.map((reason, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: reasons are static per render
										<View key={index} style={styles.reasonBlock}>
											{reason
												.split('. ')
												.filter(Boolean)
												.map((sentence, sIdx, arr) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: sentence order is fixed
													<Text key={sIdx} style={styles.reasonText}>
														{sIdx < arr.length - 1 ? `${sentence}.` : sentence}
													</Text>
												))}
										</View>
									))}
								</View>
								{!expanded && (
									<>
										<LinearGradient
											colors={['rgba(255,253,246,0)', 'rgba(255,253,246,0.97)']}
											style={styles.fadeOverlay}
										/>
										<Animated.View
											style={[styles.floatingBtnWrap, { transform: [{ translateY: floatAnim }] }]}
										>
											<TouchableOpacity
												style={styles.floatingBtn}
												onPress={handleExpand}
												activeOpacity={0.85}
											>
												<Text style={styles.floatingBtnText}>✉️ 편지 전체 보기</Text>
											</TouchableOpacity>
										</Animated.View>
									</>
								)}
							</Animated.View>
						)}
					</View>
				</View>

				{/* 편지지 하단 장식 */}
				<View style={styles.pageNumRow}>
					<Text style={styles.pageNum}>— p. 1 —</Text>
				</View>
			</View>

			{/* 키워드 섹션: 로딩 중에는 숨김 */}
			{!isLoading && keywords.length > 0 && (
				<View style={styles.kwSection}>
					<Text style={styles.kwIcon}>🔍</Text>
					{keywords.map((keyword, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: keywords are static per render
						<Badge key={index} variant="approved">
							#{keyword}
						</Badge>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFF8EE',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#E8D9C5',
	},
	noteCard: {
		backgroundColor: '#FFFDF6',
		borderWidth: 1,
		borderColor: '#E8D9C5',
		borderRadius: 10,
		overflow: 'hidden',
		shadowColor: '#C8A86B',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 2,
	},
	letterHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: '#FFF4E0',
		borderBottomWidth: 1,
		borderBottomColor: '#E8D9C5',
		gap: 8,
	},
	letterHeaderLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#C8A86B50',
	},
	letterHeaderText: {
		fontSize: 14,
	},
	noteInner: {
		flexDirection: 'row',
	},
	redMarginLine: {
		position: 'absolute',
		left: 40,
		top: 0,
		bottom: 0,
		width: 1.5,
		backgroundColor: '#FF6B6B35',
		zIndex: 1,
	},
	contentArea: {
		flex: 1,
		padding: 8,
		paddingLeft: 52,
		paddingRight: 12,
		position: 'relative',
	},
	noteLine: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: '#C8A86B28',
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 4,
	},
	cardTitle: {
		fontSize: 11,
		fontWeight: '700',
		color: '#7A4AE2',
	},
	writingBadge: {
		backgroundColor: '#FFF0D6',
		borderWidth: 1,
		borderColor: '#F0C88A',
		borderRadius: 999,
		paddingHorizontal: 6,
		paddingVertical: 1,
	},
	writingBadgeText: {
		fontSize: 10,
		fontWeight: '600',
		color: '#B9945A',
	},
	typingArea: {
		gap: 4,
		minHeight: 80,
	},
	currentLine: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	reasonsClip: {
		overflow: 'hidden',
		position: 'relative',
	},
	fadeOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 52,
	},
	floatingBtnWrap: {
		position: 'absolute',
		bottom: 10,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 10,
	},
	floatingBtn: {
		backgroundColor: '#7A4AE2',
		paddingHorizontal: 18,
		paddingVertical: 8,
		borderRadius: 999,
		shadowColor: '#7A4AE2',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 8,
		elevation: 6,
	},
	floatingBtnText: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
	},
	reasonsContainer: {
		gap: 12,
	},
	reasonBlock: {
		gap: 4,
	},
	reasonText: {
		fontSize: 22,
		lineHeight: 30,
		color: '#3A2A1A',
		fontFamily: 'Gaegu_400Regular',
	},
	pageNumRow: {
		backgroundColor: '#FFF4E0',
		borderTopWidth: 1,
		borderTopColor: '#E8D9C5',
	},
	pageNum: {
		textAlign: 'center',
		fontSize: 10,
		color: '#B9945A',
		paddingVertical: 4,
	},
	kwSection: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
		marginTop: 10,
		alignItems: 'center',
	},
	kwIcon: {
		fontSize: 11,
		color: '#999',
	},
});
