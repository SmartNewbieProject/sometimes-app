import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { tryCatch } from '@/src/shared/libs';
import {
	ensureAppleId,
	processSignup,
	validatePhone,
	validateUniversity,
} from '../services/signup-validator';
import { useModal } from '@/src/shared/hooks/use-modal';
import Signup from '..';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useTranslation } from 'react-i18next';

const { SignupSteps, useChangePhase, useSignupProgress, apis, useSignupAnalytics, useSignup } =
	Signup;

// Mixpanel track 헬퍼 함수
const track = (eventName: string, properties?: Record<string, any>) => {
	mixpanelAdapter.track(eventName, properties);
};

function useInviteCode() {
	const { t } = useTranslation();
	const router = useRouter();
	const [signupLoading, setSignupLoading] = useState(false);
	const { showErrorModal } = useModal();
	const { trackSignupEvent } = useSignupAnalytics('invite_code');
	const { updateToken } = useAuth();

	const { updateForm, form: signupForm, clear: clearSignupForm } = useSignupProgress();
	const { value: appleUserIdFromStorage, loading: storageLoading } = useStorage<string | null>({
		key: 'appleUserId',
	});
	const { removeValue: removeAppleUserId } = useStorage({
		key: 'appleUserId',
	});
	const { value: loginTypeStorage } = useStorage<string | null>({
		key: 'loginType',
	});
	const { removeValue: removeLoginType } = useStorage({ key: 'loginType' });

	const { value, removeValue } = useStorage({ key: 'invite-code' });
	const initialValue: string | undefined = typeof value === 'string' ? value : undefined;

	const nextMessage =
		signupForm?.referralCode && signupForm.referralCode !== ''
			? t('features.signup.hooks.use_invite_code.next_with_code')
			: t('features.signup.hooks.use_invite_code.skip');

	useEffect(() => {
		if (initialValue) {
			updateForm({ referralCode: initialValue });
		}
	}, [initialValue]);

	const handleInviteCode = (code: string) => {
		updateForm({ referralCode: code });
	};

	const onNext = async () => {
		setSignupLoading(true);

		if (signupForm?.referralCode && signupForm.referralCode !== '') {
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_INVITE_CODE_DONE, {
				has_code: true,
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		} else {
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_INVITE_CODE_SKIPPED, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
		}

		await tryCatch(
			async () => {
				removeValue();

				const appleOk = await ensureAppleId(signupForm, {
					router,
					loginTypeStorage,
					appleUserIdFromStorage,
					removeAppleUserId,
					removeLoginType,
					showErrorModal,
				});
				if (!appleOk) return;

				const phoneOk = await validatePhone(signupForm, {
					router,
					apis,
					trackSignupEvent,
					showErrorModal,
					removeLoginType,
				});
				if (!phoneOk) return;

				const universityOk = validateUniversity(signupForm, {
					router,
					showErrorModal,
				});
				if (!universityOk) return;

				if (!signupForm.name) {
					showErrorModal(t('features.signup.ui.validation.name_required'), 'announcement');
					return;
				}
				await processSignup(signupForm as Required<typeof signupForm>, {
					router,
					apis,
					trackSignupEvent,
					removeLoginType,
					updateToken,
					clearSignupForm,
					identifyUser: (userId) => mixpanelAdapter.identify(userId),
				});
			},
			(error) => {
				console.error('Signup error:', error);
				trackSignupEvent('error', error?.message);
				showErrorModal(
					error?.message ?? t('features.signup.hooks.use_invite_code.signup_failed'),
					'announcement',
				);
			},
		);

		setSignupLoading(false);
	};
	const onBackPress = () => {
		router.push('/auth/signup/profile-image');
		return true;
	};

	useEffect(() => {
		// 이벤트 리스너 등록
		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

		// 컴포넌트 언마운트 시 리스너 제거
		return () => subscription.remove();
	}, []);

	useChangePhase(SignupSteps.INVITE_CODE);

	return {
		onNext,
		signupLoading,
		storageLoading,
		onBackPress,
		handleInviteCode,
		code: signupForm?.referralCode ?? '',
		nextMessage,
	};
}

export default useInviteCode;
