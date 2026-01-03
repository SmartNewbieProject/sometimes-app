import { useModal } from '@/src/shared/hooks/use-modal';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { guideHeight, useOverlay } from '@/src/shared/hooks/use-overlay';
import { useMixpanel } from '@/src/shared/hooks';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import Signup from '..';
import { buildSignupForm } from '../services/signup-validator';
import { useToast } from '@/src/shared/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const { SignupSteps, useChangePhase, useSignupProgress, apis, useSignupAnalytics } = Signup;

type FormState = {
	images: (string | null)[];
};

function useProfileImage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { updateForm, form: userForm } = useSignupProgress();
	const { signupEvents } = useMixpanel();
	const [images, setImages] = useState<(string | null)[]>(
		userForm.profileImages ?? [null, null, null],
	);
	const { showOverlay, visible } = useOverlay();

	const schema = z.object({
		images: z
			.array(z.string().nullable())
			.min(1, { message: t('apps.auth.sign_up.profile_image.validation_min_images') })
			.refine((images) => images.some((img) => img !== null), {
				message: t('apps.auth.sign_up.profile_image.validation_min_images'),
			}),
	});

	const getImaages = (index: number) => {
		return images[index] ?? undefined;
	};

	const form = useForm<FormState>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
		defaultValues: {
			images: userForm.profileImages ?? [null, null, null],
		},
	});

	useEffect(() => {
		showOverlay(
			<View style={styles.infoOverlayWrapper}>
				<Text style={styles.infoTitle}>{t('apps.auth.sign_up.profile_image.info_title')}</Text>
				<Text style={styles.infoDescription}>
					{t('apps.auth.sign_up.profile_image.info_desc_1')}
				</Text>
				<Text style={styles.infoDescription}>
					{t('apps.auth.sign_up.profile_image.info_desc_2')}
				</Text>
				<Image
					source={require('@assets/images/instagram-some.png')}
					style={{
						width: 116,
						height: 175,
						position: 'absolute',
						top: 20,
						right: -66,
					}}
				/>
				<Image
					source={require('@assets/images/instagram-lock.png')}
					style={{
						width: 52,
						height: 52,
						position: 'absolute',
						top: -30,
						left: -30,
						transform: [{ rotate: '-10deg' }],
					}}
				/>
			</View>,
		);
	}, [t]);

	const onNext = async () => {
		const signupForm = buildSignupForm(userForm, images);
		updateForm(signupForm);

		const uploadedCount = images.filter((img) => img !== null).length;
		mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_PROFILE_IMAGE_UPLOADED, {
			image_count: uploadedCount,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		router.push('/auth/signup/invite-code');
	};

	const nextable = images.some((image) => image !== null);
	const { emitToast } = useToast();

	const uploadImage = (index: number, value: string) => {
		// KPI 이벤트: 프로필 이미지 업로드
		signupEvents.trackProfileImageUploaded(index + 1);

		const newImages = [...images];

		if (index === 1 || index === 2) {
			if (!newImages[0]) {
				// 대표사진이 없으면: 추가한 사진을 대표로 자동 설정
				newImages[0] = value;
				emitToast(t('apps.auth.sign_up.profile_image.toast_main_photo_set'));
			} else {
				// 대표사진이 있으면: 해당 위치에만 추가
				newImages[index] = value;
			}
		} else {
			// 0번(대표) 직접 설정
			newImages[index] = value;
		}

		setImages(newImages);
		form.trigger('images');
	};

	const onBackPress = () => {
		router.push('/auth/signup/instagram');
		return true;
	};

	useChangePhase(SignupSteps.PROFILE_IMAGE);

	useEffect(() => {
		form.setValue('images', images);
	}, [images, form]);

	useEffect(() => {
		// 이벤트 리스너 등록
		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

		// 컴포넌트 언마운트 시 리스너 제거
		return () => subscription.remove();
	}, []);

	return {
		getImaages,
		visible,
		nextable,
		uploadImage,
		onNext,
		onBackPress,
	};
}

const styles = StyleSheet.create({
	infoOverlayWrapper: {
		bottom: 200,
		position: 'absolute',

		right: 90,
		marginHorizontal: 'auto',
		paddingHorizontal: 28,
		paddingVertical: 19,
		borderRadius: 20,
		backgroundColor: semanticColors.surface.background,
		borderWidth: 1,
		borderColor: semanticColors.border.default,

		shadowColor: '#F2ECFF',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 1,
		shadowRadius: 5,
		elevation: 3, // Android에서 그림자
	},
	infoWrapper: {
		marginHorizontal: 'auto',
		paddingHorizontal: 28,
		paddingVertical: 19,
		borderRadius: 20,
		backgroundColor: semanticColors.surface.background,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		marginBottom: 223,
		shadowColor: '#F2ECFF',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 1,
		shadowRadius: 5,
		elevation: 3, // Android에서 그림자
	},
	infoTitle: {
		color: semanticColors.brand.accent,
		fontWeight: 600,
		fontFamily: 'Pretendard-SemiBold',
		lineHeight: 16.8,
		fontSize: 14,
		marginBottom: 8,
	},
	infoDescription: {
		fontSize: 11,
		lineHeight: 13.2,
		color: semanticColors.text.disabled,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		paddingTop: 16,
		paddingHorizontal: 0,
		backgroundColor: semanticColors.surface.background,
	},
});

export default useProfileImage;
