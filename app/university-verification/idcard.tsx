import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { DefaultLayout } from '@/src/features/layout/ui';
import Loading from '@/src/features/loading';
import { useVerification } from '@/src/features/university-verification/hooks/use-id-verification';
import {
	PhotoGuide,
	SecurityAssurance,
	StepIndicator,
} from '@/src/features/university-verification/ui';
import { ClockIcon } from '@/src/features/university-verification/ui/pending-review-card';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { usePhotoPicker } from '@/src/shared/hooks/use-photo-picker';
import { ImageResources, storage } from '@/src/shared/libs';
import { Button, Header, PalePurpleGradient, Text } from '@/src/shared/ui';
import { ImageResource } from '@/src/shared/ui/image-resource';
import { convertToJpeg } from '@/src/shared/utils/image';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const CameraIcon = () => (
	<Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
		<Path
			d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
			stroke={semanticColors.brand.primary}
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
		<Path
			d="M12 17a4 4 0 100-8 4 4 0 000 8z"
			stroke={semanticColors.brand.primary}
			strokeWidth={1.5}
			fill="none"
		/>
	</Svg>
);

export default function StudentVerifyPage() {
	const { showModal, showErrorModal } = useModal();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const { showPhotoPicker } = usePhotoPicker();

	const [image, setImage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState<boolean | null>(null);
	const { submitOne, submitting } = useVerification();

	useEffect(() => {
		const checkPending = async () => {
			const pending = await storage.getItem('university-verification-pending');
			setIsPending(pending === 'true');
		};
		checkPending();
	}, []);

	const nextable = !!image;

	const pickFromGallery = useCallback(async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', '사진을 가져오기 위해서는 권한이 필요합니다.', [
				{ text: t('common.설정_열기'), onPress: () => Linking.openSettings() },
				{ text: t('common.닫기') },
			]);
			return null;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: false,
			selectionLimit: 1,
		});
		if (!result.canceled) {
			const jpegUri = await convertToJpeg(result.assets[0].uri);
			setImage(jpegUri);
		}
		return null;
	}, [t]);

	const takePhoto = useCallback(async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('권한 필요', '카메라 사용을 위해서 권한이 필요합니다.', [
				{ text: t('common.설정_열기'), onPress: () => Linking.openSettings() },
				{ text: t('common.닫기') },
			]);
			return null;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: false,
			selectionLimit: 1,
		});
		if (!result.canceled) {
			const jpegUri = await convertToJpeg(result.assets[0].uri);
			setImage(jpegUri);
		}
		return null;
	}, [t]);

	const handlePickImage = () => {
		showPhotoPicker({
			onTakePhoto: takePhoto,
			onPickFromGallery: pickFromGallery,
			showGuide: false,
		});
	};

	const onSubmit = async () => {
		if (!image) return;

		try {
			const response = await submitOne(image);
			const successMessage =
				response?.message || t('apps.university-verification.idcard.upload_success_message');

			await storage.setItem('university-verification-pending', 'true');

			showModal({
				title: t('apps.university-verification.idcard.upload_success_title'),
				children: successMessage,
				primaryButton: {
					text: t('shareds.utils.common.confirm'),
					onClick: () => router.replace('/'),
				},
			});
		} catch (error: unknown) {
			const resolvedError = error as { message?: string };
			showErrorModal(
				resolvedError.message || t('apps.university-verification.idcard.upload_error'),
				'announcement',
			);
		}
	};

	if (submitting || isPending === null) return <Loading.Page />;

	return (
		<DefaultLayout style={styles.container}>
			<PalePurpleGradient />
			<Header.Container>
				<Header.LeftContent>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<ChevronLeftIcon width={24} height={24} />
					</Pressable>
				</Header.LeftContent>
				<Header.CenterContent>
					<Text size="lg" weight="normal" textColor="black">
						{t('apps.university-verification.idcard.page_title')}
					</Text>
				</Header.CenterContent>
				<Header.RightContent />
			</Header.Container>

			<StepIndicator currentStep={isPending ? 2 : 1} />

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
				showsVerticalScrollIndicator={false}
			>
				{isPending ? (
					<>
						<View style={styles.pendingContent}>
							<View style={styles.pendingIconWrap}>
								<ClockIcon size={48} color={semanticColors.brand.primary} strokeWidth={1.5} />
							</View>
							<Text weight="semibold" size="20" textColor="black" style={styles.pendingTitle}>
								{t('apps.university-verification.idcard.pending_title')}
							</Text>
							<Text weight="normal" size="sm" style={styles.pendingDesc}>
								{t('apps.university-verification.idcard.pending_desc')}
							</Text>
						</View>

						<View style={styles.guidePadding}>
							<SecurityAssurance />
						</View>
					</>
				) : (
					<>
						<View style={styles.contentPadding}>
							<Text weight="semibold" size="20" textColor="black" style={styles.titleText}>
								{t('apps.university-verification.idcard.main_title')}
							</Text>
							<Text weight="medium" size="sm" textColor="pale-purple">
								{t('apps.university-verification.idcard.main_subtitle')}
							</Text>
							<Text weight="medium" size="sm" textColor="pale-purple">
								{t('apps.university-verification.idcard.file_format')}
							</Text>
						</View>

						<Pressable style={styles.uploadCard} onPress={handlePickImage}>
							{image ? (
								<Image source={{ uri: image }} style={styles.uploadThumbnail} contentFit="cover" />
							) : (
								<View style={styles.uploadIconWrap}>
									<CameraIcon />
								</View>
							)}
							<View style={styles.uploadTextWrap}>
								<Text size="sm" weight="semibold" textColor="black">
									{image
										? t('apps.university-verification.idcard.photo_uploaded')
										: t('apps.university-verification.idcard.upload_photo')}
								</Text>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.muted }}>
									{image
										? t('apps.university-verification.idcard.tap_to_change')
										: t('apps.university-verification.idcard.main_subtitle')}
								</Text>
							</View>
							<Text size="xs" weight="medium" style={{ color: semanticColors.brand.primary }}>
								{image
									? t('apps.university-verification.idcard.change')
									: t('apps.university-verification.idcard.select')}
							</Text>
						</Pressable>

						<View style={styles.guidePadding}>
							<PhotoGuide />
						</View>

						<View style={styles.guidePadding}>
							<SecurityAssurance />
						</View>

						<View style={styles.rewardBanner}>
							<ImageResource resource={ImageResources.GEM} width={20} height={20} />
							<View style={styles.rewardTextWrap}>
								<Text size="xs" weight="semibold" style={{ color: semanticColors.brand.primary }}>
									{t('apps.university-verification.reward_banner.title')}
								</Text>
								<Text size="xs" weight="normal" style={{ color: semanticColors.text.muted }}>
									{t('apps.university-verification.reward_banner.subtitle')}
								</Text>
							</View>
						</View>

						<Text size="xs" weight="normal" style={styles.processInfo}>
							{t('apps.university-verification.process_info')}
						</Text>
					</>
				)}
			</ScrollView>

			<View style={styles.bottom}>
				<LinearGradient
					colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', '#FFFFFF']}
					style={StyleSheet.absoluteFill}
					pointerEvents="none"
				/>
				<View style={[styles.bottomInner, { paddingBottom: insets.bottom + 16 }]}>
					{isPending ? (
						<Button variant="primary" size="md" onPress={() => router.replace('/my')} width="full">
							{t('apps.university-verification.idcard.go_back')}
						</Button>
					) : (
						<Button
							variant="primary"
							size="md"
							disabled={!nextable}
							onPress={onSubmit}
							width="full"
						>
							{t('apps.university-verification.idcard.submit_button')}
						</Button>
					)}
				</View>
			</View>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	scrollContent: {
		flex: 1,
	},
	contentPadding: {
		paddingHorizontal: 20,
	},
	guidePadding: {
		paddingHorizontal: 20,
		marginTop: 12,
	},
	titleText: {
		marginTop: 8,
	},
	uploadCard: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 20,
		marginTop: 12,
		padding: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: semanticColors.brand.primaryLight,
		gap: 12,
	},
	uploadIconWrap: {
		width: 52,
		height: 52,
		borderRadius: 12,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	uploadThumbnail: {
		width: 52,
		height: 52,
		borderRadius: 12,
	},
	uploadTextWrap: {
		flex: 1,
		gap: 2,
	},
	rewardBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginHorizontal: 20,
		marginTop: 16,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 12,
		padding: 14,
	},
	rewardTextWrap: {
		flex: 1,
		gap: 2,
	},
	processInfo: {
		color: semanticColors.text.muted,
		textAlign: 'center',
		marginTop: 16,
		marginHorizontal: 20,
		lineHeight: 18,
	},
	pendingContent: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 40,
		paddingBottom: 24,
	},
	pendingIconWrap: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: semanticColors.surface.secondary,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	pendingTitle: {
		textAlign: 'center',
		marginBottom: 8,
	},
	pendingDesc: {
		textAlign: 'center',
		color: semanticColors.text.muted,
		lineHeight: 20,
	},
	bottom: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	bottomInner: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
});
