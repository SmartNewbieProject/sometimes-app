import colors from '@/src/shared/constants/colors';
import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import type { FeedbackCategory } from '../api';
import { useSubmitFeedback } from '../hooks/use-submit-feedback';

type FeedbackLetterContentProps = {
	onSuccess: () => void;
	onError?: () => void;
};

const CATEGORIES: { key: FeedbackCategory; label: string; emoji: string }[] = [
	{ key: 'general', label: '일반', emoji: '💬' },
	{ key: 'bug', label: '버그', emoji: '🐛' },
	{ key: 'feature', label: '기능 제안', emoji: '✨' },
	{ key: 'other', label: '기타', emoji: '📝' },
];

const MAX_LENGTH = 2000;

// 텍스트 lineHeight과 정확히 맞추는 상수
const LINE_HEIGHT = 40;
const LETTER_PADDING_TOP = 16;
const VISIBLE_LINES = 6;                                          // 보여지는 줄 수
const COUNTER_HEIGHT = 36;                                        // 카운터 영역 높이
const LETTER_BOX_HEIGHT =
	LETTER_PADDING_TOP + VISIBLE_LINES * LINE_HEIGHT + COUNTER_HEIGHT; // 292

function LinedBackground() {
	return (
		<View style={StyleSheet.absoluteFill} pointerEvents="none">
			{Array.from({ length: VISIBLE_LINES }).map((_, i) => (
				<View
					key={i}
					style={[
						lineStyles.line,
						{ top: LETTER_PADDING_TOP + (i + 1) * LINE_HEIGHT - 1 },
					]}
				/>
			))}
		</View>
	);
}

const lineStyles = StyleSheet.create({
	line: {
		position: 'absolute',
		left: 16,
		right: 16,
		height: 1,
		backgroundColor: '#DDD4FF',
	},
});

export function FeedbackLetterContent({ onSuccess, onError }: FeedbackLetterContentProps) {
	const { t } = useTranslation();
	const [message, setMessage] = useState('');
	const [category, setCategory] = useState<FeedbackCategory>('general');
	const { mutate, isPending } = useSubmitFeedback();

	const canSubmit = message.trim().length >= 5 && !isPending;

	const handleSubmit = () => {
		if (!canSubmit) return;
		mutate(
			{ message: message.trim(), category },
			{
				onSuccess: () => onSuccess(),
				onError: () => onError?.(),
			},
		);
	};

	return (
		<KeyboardAvoidingView
			style={styles.keyboardAvoid}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* 타이틀 */}
				<View style={styles.header}>
					<Text size="18" weight="bold" textColor="black" style={styles.centerText}>
						{t('features.feedback.ui.letter.title')}
					</Text>
					<Text size="13" textColor="disabled" style={styles.centerText}>
						{t('features.feedback.ui.letter.subtitle')}
					</Text>
				</View>

				{/* 구슬 보상 안내 */}
				<View style={styles.rewardBadge}>
					<ImageResource resource={ImageResources.GEM} width={16} height={16} />
					<Text size="13" weight="bold" style={styles.rewardText}>
						{t('features.feedback.ui.letter.reward')}
					</Text>
				</View>

				{/* 카테고리 칩 */}
				<View style={styles.categoryRow}>
					{CATEGORIES.map((cat) => (
						<Pressable
							key={cat.key}
							style={[styles.chip, category === cat.key && styles.chipSelected]}
							onPress={() => setCategory(cat.key)}
						>
							<Text
								size="12"
								weight={category === cat.key ? 'bold' : 'regular'}
								style={category === cat.key ? styles.chipTextSelected : styles.chipText}
							>
								{cat.emoji} {cat.label}
							</Text>
						</Pressable>
					))}
				</View>

				{/* 줄 노트 편지지 */}
				<View style={styles.letterBox}>
					<LinedBackground />
					<TextInput
						style={styles.textInput}
						value={message}
						onChangeText={setMessage}
						placeholder={t('features.feedback.ui.letter.placeholder')}
						placeholderTextColor="#C0B0E8"
						multiline
						textAlignVertical="top"
						maxLength={MAX_LENGTH}
					/>
					<View style={styles.counterContainer}>
						<Text size="12" style={styles.counter}>
							{message.length}/{MAX_LENGTH}
						</Text>
					</View>
				</View>

				{/* 제출 버튼 */}
				<Pressable
					style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
					onPress={handleSubmit}
					disabled={!canSubmit}
				>
					{isPending ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text weight="bold" size="16" style={styles.submitText}>
							{t('features.feedback.ui.letter.submit')}
						</Text>
					)}
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	keyboardAvoid: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 0,
		gap: 16,
	},
	header: {
		alignItems: 'center',
		gap: 6,
	},
	centerText: {
		textAlign: 'center',
	},
	rewardBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: '#FFF8E1',
		borderRadius: 100,
		paddingHorizontal: 16,
		paddingVertical: 8,
		alignSelf: 'center',
	},
	rewardText: {
		color: '#D4860A',
	},
	categoryRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'center',
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: '#E2D6FF',
		backgroundColor: colors.white,
	},
	chipSelected: {
		borderColor: colors.primaryPurple,
		backgroundColor: '#F5F0FF',
	},
	chipText: {
		color: '#939598',
	},
	chipTextSelected: {
		color: colors.primaryPurple,
	},
	letterBox: {
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: '#DDD4FF',
		height: LETTER_BOX_HEIGHT,
		overflow: 'hidden',
		backgroundColor: '#FDFBFF',
	},
	textInput: {
		flex: 1,
		fontSize: 17,
		fontFamily: 'Pretendard',
		color: '#1A1A2E',
		lineHeight: LINE_HEIGHT,
		paddingHorizontal: 16,
		paddingTop: LETTER_PADDING_TOP,
		paddingBottom: 0,
		backgroundColor: 'transparent',
	},
	counterContainer: {
		alignItems: 'flex-end',
		paddingHorizontal: 16,
		paddingBottom: 12,
		paddingTop: 4,
	},
	counter: {
		color: '#A892D7',
	},
	submitButton: {
		height: 52,
		borderRadius: 20,
		backgroundColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	submitButtonDisabled: {
		backgroundColor: '#C4B5F4',
	},
	submitText: {
		color: colors.white,
	},
});
