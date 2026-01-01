import type { Router } from 'expo-router';
import { Platform } from 'react-native';
import type { SignupForm } from '../hooks/use-signup-progress';
import { jpSignup } from '@/src/features/jp-auth/apis';
import i18n from '@/src/shared/libs/i18n';

export function buildSignupForm(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	userForm: any,
	images: (string | null | undefined)[],
) {
	return {
		...userForm,
		profileImages: images.filter(Boolean) as string[],
	};
}

export async function ensureAppleId(
	signupForm: Partial<SignupForm>,
	{
		router,
		loginTypeStorage,
		appleUserIdFromStorage,
		removeAppleUserId,
		removeLoginType,
		showErrorModal,
	}: {
		router: Router;
		loginTypeStorage: string | null | undefined;
		appleUserIdFromStorage: string | null | undefined;
		removeAppleUserId: () => Promise<void>;
		removeLoginType: () => Promise<void>;
		showErrorModal: (message: string, type: 'announcement' | 'error') => void;
	},
): Promise<boolean> {
	if (Platform.OS === 'ios' && loginTypeStorage === 'apple') {
		if (appleUserIdFromStorage) {
			signupForm.appleId = appleUserIdFromStorage;
			return true;
		}
		await removeAppleUserId();
		await removeLoginType();
		showErrorModal(i18n.t('features.signup.ui.validators.no_apple_login_info'), 'announcement');
		router.push('/auth/login');
		return false;
	}

	if (Platform.OS === 'web' && sessionStorage.getItem('loginType') === 'apple') {
		const appleIdFromSession = sessionStorage.getItem('appleUserId');
		if (appleIdFromSession) {
			signupForm.appleId = appleIdFromSession;
			return true;
		}
		sessionStorage.removeItem('appleUserId');
		sessionStorage.removeItem('loginType');
		showErrorModal(i18n.t('features.signup.ui.validators.no_apple_login_info'), 'announcement');
		router.push('/auth/login');
		return false;
	}

	return true;
}

export async function validatePhone(
	signupForm: Partial<SignupForm>,
	{
		router,
		apis,
		trackSignupEvent,
		showErrorModal,
		removeLoginType,
	}: {
		router: Router;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		apis: any;
		trackSignupEvent: (event: string, detail?: string) => void;
		showErrorModal: (message: string, type: 'announcement' | 'error') => void;
		removeLoginType: () => Promise<void>;
	},
): Promise<boolean> {
	const phone = signupForm.phone || signupForm.phoneNumber;

	if (!phone) {
		showErrorModal(i18n.t('features.signup.ui.validators.no_phone_number'), 'announcement');
		trackSignupEvent('phone_missing');
		router.push('/auth/login');
		return false;
	}

	if (signupForm.loginType === 'jp_sms' || signupForm.loginType === 'apple_jp') {
		return true;
	}

	const { exists } = await apis.checkPhoneNumberExists(phone);
	if (exists) {
		showErrorModal(i18n.t('features.signup.ui.validators.already_registered'), 'announcement');
		trackSignupEvent('phone_already_exists');

		if (Platform.OS === 'ios') await removeLoginType();
		else if (Platform.OS === 'web') sessionStorage.removeItem('loginType');

		router.push('/auth/login');
		return false;
	}

	return true;
}

export function validateUniversity(
	signupForm: Partial<SignupForm>,
	{
		router,
		showErrorModal,
	}: {
		router: Router;
		showErrorModal: (message: string, type: 'announcement' | 'error') => void;
	},
): boolean {
	if (!signupForm.universityId || !signupForm.departmentName) {
		showErrorModal(i18n.t('features.signup.ui.validators.no_university_info'), 'announcement');
		router.navigate('/auth/signup/university');
		return false;
	}
	return true;
}

export async function processSignup(
	signupForm: SignupForm,
	{
		router,
		apis,
		trackSignupEvent,
		trackKpiEvent,
		removeLoginType,
		updateToken,
		clearSignupForm,
		identifyUser,
	}: {
		router: Router;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		apis: any;
		trackSignupEvent: (event: string, detail?: string) => void;
		trackKpiEvent?: (event: string, data?: any) => void;
		removeLoginType: () => Promise<void>;
		updateToken: (accessToken: string, refreshToken: string) => Promise<void>;
		clearSignupForm: () => void;
		identifyUser?: (userId: string) => void;
	},
): Promise<void> {
	const isJpSmsUser = signupForm.loginType === 'jp_sms';

	const response = isJpSmsUser
		? await jpSignup({
				phoneNumber: signupForm.phoneNumber || signupForm.phone,
				name: signupForm.name,
				gender: signupForm.gender,
				birthday: signupForm.birthday,
				age: signupForm.age ?? 0,
				universityId: signupForm.universityId,
				departmentName: signupForm.departmentName,
				grade: signupForm.grade,
				studentNumber: signupForm.studentNumber,
				profileImages: signupForm.profileImages as unknown as File[],
				mainImageIndex: 0,
				instagramId: signupForm.instagramId,
				referralCode: signupForm.referralCode,
			})
		: await apis.signup(signupForm);

	console.log('[processSignup] signup response:', JSON.stringify(response, null, 2));

	const profileFields = [
		'phone',
		'universityId',
		'profileImages',
		'name',
		'birthday',
		'gender',
		'departmentName',
		'grade',
		'studentNumber',
		'instagramId',
	];
	const completedFields = profileFields.filter((field) => {
		if (field === 'profileImages') {
			return signupForm.profileImages?.some((img) => img !== null) || false;
		}
		return (
			signupForm[field as keyof typeof signupForm] !== undefined &&
			signupForm[field as keyof typeof signupForm] !== null &&
			signupForm[field as keyof typeof signupForm] !== ''
		);
	});

	const completionRate = Math.round((completedFields.length / profileFields.length) * 100);

	if (trackKpiEvent) {
		trackKpiEvent('Profile_Completion_Updated', {
			profile_completion_rate: completionRate,
			completed_fields: completedFields,
		});

		trackKpiEvent('Signup_Completed', {
			profile_completion_rate: completionRate,
			total_duration: Date.now() - (signupForm.signupStartTime || Date.now()),
		});
	}

	trackSignupEvent('complete');

	if (Platform.OS === 'ios') await removeLoginType();
	else if (Platform.OS === 'web') sessionStorage.removeItem('loginType');

	await updateToken(response.accessToken, response.refreshToken);

	if (identifyUser && response.id) {
		identifyUser(response.id);
	}

	clearSignupForm();

	console.log('[processSignup] signup & login completed, navigating to done page');

	router.replace('/auth/signup/done');
}
