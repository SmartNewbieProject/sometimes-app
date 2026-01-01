import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import { useModal } from '@/src/shared/hooks/use-modal';
import { LetterInput } from '@/src/features/like-letter/ui/letter-input';
import { LetterPrompts } from '@/src/features/like-letter/ui/letter-prompts';
import { LetterPreviewCard } from '@/src/features/like-letter/ui/letter-preview-card';
import { useLikeWithLetter } from '@/src/features/like-letter/hooks/use-like-with-letter';
import { useFeatureCost } from '@features/payment/hooks';
import { validateLetter } from '@/src/features/like-letter/utils/letter-validator';
import { useTranslation } from 'react-i18next';

type WriteParams = {
	connectionId: string;
	nickname: string;
	profileUrl: string;
	age?: string;
	universityName?: string;
};

export default function LikeLetterWriteScreen() {
	const params = useLocalSearchParams<WriteParams>();
	const insets = useSafeAreaInsets();
	const { showModal, hideModal } = useModal();
	const { sendLikeWithLetter } = useLikeWithLetter();
	const { featureCosts } = useFeatureCost();
	const { t } = useTranslation();

	const [letter, setLetter] = useState('');
	const [isValid, setIsValid] = useState(true);
	const [isSending, setIsSending] = useState(false);

	const connectionId = params.connectionId;
	const nickname = params.nickname || t('features.like-letter.ui.write_screen.default_nickname');
	const profileUrl = params.profileUrl ? decodeURIComponent(params.profileUrl) : '';
	const age = params.age ? Number.parseInt(params.age, 10) : undefined;
	const universityName = params.universityName || '';

	const letterLikeCost = (featureCosts as Record<string, number>)?.LIKE_WITH_LETTER ?? 11;

	const handleLetterChange = useCallback((text: string) => {
		setLetter(text);
	}, []);

	const handleValidationChange = useCallback((valid: boolean) => {
		setIsValid(valid);
	}, []);

	const handlePromptSelect = useCallback((prompt: string) => {
		setLetter(prompt);
		const validation = validateLetter(prompt);
		setIsValid(validation.isValid);
	}, []);

	const handleViewProfile = useCallback(() => {
		router.push({
			pathname: '/partner/view/[id]',
			params: { id: connectionId },
		});
	}, [connectionId]);

	const handlePreview = useCallback(() => {
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
							nickname,
							age: age ?? 0,
							universityName,
							letter,
							profileUrl,
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
	}, [showModal, hideModal, nickname, age, universityName, letter, profileUrl, t]);

	const handleSendLetter = useCallback(async () => {
		if (!isValid || letter.trim().length === 0 || isSending) {
			return;
		}

		setIsSending(true);
		try {
			await sendLikeWithLetter(connectionId, letter.trim());
		} finally {
			setIsSending(false);
		}
	}, [isValid, letter, isSending, sendLikeWithLetter, connectionId]);

	const canSend = isValid && letter.trim().length > 0 && !isSending;

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.profileSection}>
					<View style={styles.profileInfo}>
						{profileUrl ? (
							<Image source={{ uri: profileUrl }} style={styles.profileImage} contentFit="cover" />
						) : (
							<View style={[styles.profileImage, styles.profilePlaceholder]} />
						)}
						<View style={styles.profileText}>
							<Text weight="semibold" size="18" textColor="black">
								{nickname}
							</Text>
							{age && universityName && (
								<Text size="14" style={styles.profileSubtext}>
									만 {age}세 · {universityName}
								</Text>
							)}
						</View>
					</View>
					<Pressable style={styles.viewProfileButton} onPress={handleViewProfile}>
						<Text size="12" style={styles.viewProfileText}>
							{t('features.like-letter.ui.write_screen.view_profile')}
						</Text>
					</Pressable>
				</View>

				<View style={styles.inputSection}>
					<LetterInput
						value={letter}
						onChangeText={handleLetterChange}
						onValidationChange={handleValidationChange}
						placeholder={t('features.like-letter.ui.write_screen.placeholder')}
					/>
				</View>

				<View style={styles.promptsSection}>
					<LetterPrompts onSelect={handlePromptSelect} />
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
					style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
					onPress={handleSendLetter}
					disabled={!canSend}
				>
					<View style={styles.sendButtonContent}>
						<ImageResource resource={ImageResources.GEM} width={22} height={22} />
						<Text size="14" style={styles.gemCount}>
							x{letterLikeCost}
						</Text>
						<Text weight="semibold" size="16" style={styles.sendButtonText}>
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
		backgroundColor: '#FBF9FF',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
	},
	profileSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	profileInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	profilePlaceholder: {
		backgroundColor: '#E2D6FF',
	},
	profileText: {
		gap: 2,
	},
	profileSubtext: {
		color: '#6B7280',
	},
	viewProfileButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: colors.primaryPurple,
	},
	viewProfileText: {
		color: colors.primaryPurple,
	},
	inputSection: {
		marginBottom: 16,
	},
	promptsSection: {
		marginBottom: 20,
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
		backgroundColor: colors.primaryPurple,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sendButtonDisabled: {
		backgroundColor: '#D1D5DB',
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
		color: colors.white,
		marginLeft: 4,
	},
	previewHeader: {
		alignItems: 'center',
		marginBottom: 10,
	},
	previewContent: {
		width: '100%',
	},
});
