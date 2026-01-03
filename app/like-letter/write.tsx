import { useCallback, useState, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import { ImageResources } from '@/src/shared/libs';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { ImageResource, Text } from '@/src/shared/ui';
import { useModal } from '@/src/shared/hooks/use-modal';
import { LetterInput } from '@/src/features/like-letter/ui/letter-input';
import { LetterPrompts } from '@/src/features/like-letter/ui/letter-prompts';
import { LetterPreviewCard } from '@/src/features/like-letter/ui/letter-preview-card';
import { useLikeWithLetter } from '@/src/features/like-letter/hooks/use-like-with-letter';
import { useFeatureCost } from '@features/payment/hooks';
import { validateLetter } from '@/src/features/like-letter/utils/letter-validator';
import { useTranslation } from 'react-i18next';
import Match from '@features/match';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

type WriteParams = {
	connectionId: string;
	matchId?: string;
	nickname: string;
	profileUrl: string;
	canLetter?: string;
	age?: string;
	universityName?: string;
	source?: string;
};

const { useMatchPartnerQuery } = Match.queries;

export default function LikeLetterWriteScreen() {
	const params = useLocalSearchParams<WriteParams>();
	const insets = useSafeAreaInsets();
	const { showModal, hideModal } = useModal();
	const { sendLikeWithLetter } = useLikeWithLetter();
	const { featureCosts } = useFeatureCost();
	const { t } = useTranslation();
	const { profileDetails } = useAuth();

	const [letter, setLetter] = useState('');
	const [isValid, setIsValid] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [isFromPrompt, setIsFromPrompt] = useState(false);
	const startTimeRef = useRef(Date.now());

	const connectionId = params.connectionId;
	const matchId = params.matchId;
	const canLetter = params.canLetter === 'true';
	const source = (params.source as 'home' | 'profile') || 'home';

	useEffect(() => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_WRITE_STARTED, {
			connection_id: connectionId,
			match_id: matchId,
			entry_source: source,
			can_letter: canLetter,
			entry_method: canLetter ? 'direct' : 'after_purchase',
		});
	}, []);

	const { data: partner } = useMatchPartnerQuery(matchId);

	const partnerProfileUrl = params.profileUrl
		? decodeURIComponent(params.profileUrl)
		: partner?.profileImages?.find((img) => img.isMain)?.imageUrl ||
			partner?.profileImages?.find((img) => img.isMain)?.url ||
			partner?.profileImages?.[0]?.imageUrl ||
			partner?.profileImages?.[0]?.url ||
			'';
	const partnerNickname =
		params.nickname || partner?.name || t('features.like-letter.ui.write_screen.default_nickname');
	const partnerAge = params.age ? Number.parseInt(params.age, 10) : partner?.age;
	const partnerUniversityName = params.universityName || partner?.universityDetails?.name || '';

	const myProfileUrl =
		profileDetails?.profileImages?.find((img) => img.isMain)?.imageUrl ||
		profileDetails?.profileImages?.find((img) => img.isMain)?.url ||
		profileDetails?.profileImages?.[0]?.imageUrl ||
		profileDetails?.profileImages?.[0]?.url ||
		'';
	const myNickname = profileDetails?.name || '';
	const myAge = profileDetails?.age || 0;
	const myUniversityName = profileDetails?.universityDetails?.name || '';

	const simpleLikeCost = (featureCosts as Record<string, number>)?.LIKE_MESSAGE ?? 9;
	const baseLetterLikeCost = (featureCosts as Record<string, number>)?.LIKE_WITH_LETTER ?? 11;
	const letterLikeCost = canLetter ? 0 : baseLetterLikeCost;

	const handleLetterChange = useCallback((text: string) => {
		setLetter(text);
	}, []);

	const handleValidationChange = useCallback((valid: boolean) => {
		setIsValid(valid);
	}, []);

	const handlePromptSelect = useCallback(
		(prompt: string, promptIndex?: number) => {
			setLetter(prompt);
			setIsFromPrompt(true);
			const validation = validateLetter(prompt);
			setIsValid(validation.isValid);

			mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_PROMPT_SELECTED, {
				connection_id: connectionId,
				match_id: matchId,
				prompt_index: promptIndex,
				prompt_text_preview: prompt.slice(0, 20),
			});
		},
		[connectionId, matchId],
	);

	const handleViewProfile = useCallback(() => {
		if (!matchId) return;
		router.push({
			pathname: '/partner/view/[id]',
			params: { id: matchId, redirectTo: encodeURIComponent('/like-letter/write') },
		});
	}, [matchId]);

	const handlePreview = useCallback(() => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_PREVIEW_VIEWED, {
			connection_id: connectionId,
			match_id: matchId,
			letter_length: letter.length,
		});

		showModal({
			showLogo: false,
			customTitle: (
				<View style={styles.previewHeader}>
					<Text weight="bold" size="18" textColor="black">
						{t('features.like-letter.ui.write_screen.preview_title')}
					</Text>
				</View>
			),
			children: (
				<View style={styles.previewContent}>
					<LetterPreviewCard
						data={{
							nickname: myNickname,
							age: myAge,
							universityName: myUniversityName,
							letter,
							profileUrl: myProfileUrl,
						}}
						showChatButton={false}
					/>
				</View>
			),
			primaryButton: {
				text: t('shareds.utils.common.confirm'),
				onClick: hideModal,
			},
		});
	}, [
		showModal,
		hideModal,
		myNickname,
		myAge,
		myUniversityName,
		letter,
		myProfileUrl,
		t,
		connectionId,
		matchId,
	]);

	const handleSendLetter = useCallback(async () => {
		if (!isValid || letter.trim().length === 0 || isSending) {
			return;
		}

		const timeToSend = Math.floor((Date.now() - startTimeRef.current) / 1000);

		mixpanelAdapter.track(MIXPANEL_EVENTS.LETTER_LIKE_SENT, {
			connection_id: connectionId,
			match_id: matchId,
			letter_length: letter.trim().length,
			is_from_prompt: isFromPrompt,
			time_to_send_seconds: timeToSend,
			gem_cost: canLetter ? 0 : letterLikeCost,
		});

		setIsSending(true);
		try {
			await sendLikeWithLetter(connectionId, letter.trim(), {
				source,
				matchId,
				isFromPrompt,
				letterLength: letter.trim().length,
			});
		} finally {
			setIsSending(false);
		}
	}, [
		isValid,
		letter,
		isSending,
		sendLikeWithLetter,
		connectionId,
		source,
		matchId,
		isFromPrompt,
		canLetter,
		letterLikeCost,
	]);

	const canSend = isValid && letter.trim().length > 0 && !isSending;

	return (
		<View style={styles.container}>
			<View style={styles.headerBackground}>
				<Image
					source={require('@assets/images/like-letter/bg-line.png')}
					style={styles.bgLine}
					contentFit="contain"
				/>
				<View style={styles.profileContainer}>
					<View style={styles.profileWrapper}>
						{partnerProfileUrl ? (
							<Image
								source={{ uri: partnerProfileUrl }}
								style={styles.profileImage}
								contentFit="cover"
							/>
						) : (
							<View style={[styles.profileImage, styles.profilePlaceholder]} />
						)}
						<View style={styles.heartBubbleContainer}>
							<Image
								source={require('@assets/images/like-letter/heart-bubble.png')}
								style={styles.heartBubble}
								contentFit="contain"
							/>
						</View>
					</View>
				</View>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.introCard}>
					<Pressable style={styles.viewProfileButton} onPress={handleViewProfile}>
						<Text size="12" weight="medium" style={styles.viewProfileText}>
							{t('features.like-letter.ui.write_screen.view_profile')}
						</Text>
					</Pressable>
					<Text style={styles.introText}>
						<Text weight="bold" size="18" style={styles.highlightText}>
							{partnerNickname}
						</Text>
						<Text weight="medium" size="18" textColor="black">
							님에게 보내는 편지
						</Text>
					</Text>
					<Text size="12" textColor="disabled" style={styles.subIntroText}>
						프로필에서 한 가지를 언급하면 더 자연스러워요!
					</Text>
				</View>

				<View style={styles.promptsSection}>
					<LetterPrompts connectionId={connectionId} onSelect={handlePromptSelect} />
				</View>

				<View style={styles.inputSection}>
					<LetterInput
						value={letter}
						onChangeText={handleLetterChange}
						onValidationChange={handleValidationChange}
						placeholder={t('features.like-letter.ui.write_screen.placeholder')}
					/>
				</View>
			</ScrollView>

			<View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 16) }]}>
				<Pressable
					style={[styles.previewButton, !letter.trim() && styles.buttonDisabled]}
					onPress={handlePreview}
					disabled={!letter.trim()}
				>
					<Text
						weight="medium"
						size="16"
						style={[styles.previewButtonText, !letter.trim() ? styles.buttonTextDisabled : {}]}
					>
						{t('features.like-letter.ui.write_screen.preview_button')}
					</Text>
				</Pressable>

				<Pressable
					style={[styles.sendButton, canSend && styles.sendButtonActive]}
					onPress={handleSendLetter}
					disabled={!canSend}
				>
					<View style={styles.sendButtonContent}>
						{!canLetter && (
							<>
								<ImageResource resource={ImageResources.GEM} width={22} height={22} />
								<Text size="14" style={styles.gemCount}>
									x{letterLikeCost}
								</Text>
							</>
						)}
						<Text
							weight="semibold"
							size="16"
							style={[styles.sendButtonText, canSend ? styles.sendButtonTextActive : {}]}
						>
							{isSending
								? t('features.like-letter.ui.write_screen.sending')
								: t('features.like-letter.ui.write_screen.send_button')}
						</Text>
					</View>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	headerBackground: {
		height: 180,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.white,
		overflow: 'visible',
		zIndex: 1,
	},
	bgLine: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 10,
	},
	profileContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2,
	},
	profileWrapper: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colors.primaryPurple, // 보라색 테두리
		padding: 2, // 테두리와 이미지 사이 간격
		backgroundColor: colors.white,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileImage: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
	},
	profilePlaceholder: {
		backgroundColor: '#E2D6FF',
	},
	heartBubbleContainer: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: 34,
		height: 34,
	},
	heartBubble: {
		width: '100%',
		height: '100%',
	},
	scrollView: {
		flex: 1,
		zIndex: 0,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	introCard: {
		backgroundColor: '#FBF9FF',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E2D6FF',
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 16,
		gap: 8,
	},
	viewProfileButton: {
		backgroundColor: colors.primaryPurple,
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 6,
		marginBottom: 4,
	},
	viewProfileText: {
		color: colors.white,
	},
	introText: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 2,
	},
	highlightText: {
		color: colors.primaryPurple,
	},
	subIntroText: {
		textAlign: 'center',
	},
	promptsSection: {
		marginBottom: 16,
	},
	inputSection: {
		marginBottom: 16,
		minHeight: 200, // 입력창 최소 높이 확보
	},
	bottomSection: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingTop: 12,
		gap: 10,
		backgroundColor: colors.white,
		borderTopWidth: 1,
		borderTopColor: '#F3F4F6',
	},
	previewButton: {
		flex: 1,
		height: 50,
		borderRadius: 10,
		borderWidth: 1.5,
		borderColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.white,
	},
	previewButtonText: {
		color: colors.primaryPurple,
	},
	buttonDisabled: {
		borderColor: '#D1D5DB',
	},
	buttonTextDisabled: {
		color: '#9CA3AF',
	},
	sendButton: {
		flex: 2,
		height: 50,
		borderRadius: 10,
		backgroundColor: '#F3F4F6', // 초기 배경색 (활성화 전)
		alignItems: 'center',
		justifyContent: 'center',
	},
	sendButtonDisabled: {
		backgroundColor: '#F3F4F6',
	},
	sendButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	gemCount: {
		color: '#BEACFF',
	},
	sendButtonText: {
		color: '#9CA3AF', // 비활성화 텍스트 색상
	},
	// 활성화된 버튼 스타일
	sendButtonActive: {
		backgroundColor: colors.primaryPurple,
	},
	sendButtonTextActive: {
		color: colors.white,
	},
	previewHeader: {
		alignItems: 'center',
		marginBottom: 10,
	},
	previewContent: {
		width: '100%',
	},
});
