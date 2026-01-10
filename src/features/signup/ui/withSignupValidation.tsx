import { useModal } from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { type SignupForm, SignupSteps, useSignupProgress } from '../hooks';
import i18n from '@/src/shared/libs/i18n';

interface PageValidation {
	requiredFields: (keyof SignupForm)[];
	redirectTo: string;
	messageKey: string;
}

const PAGE_VALIDATIONS: Record<SignupSteps, PageValidation> = {
	[SignupSteps.UNIVERSITY]: {
		requiredFields: [],
		redirectTo: '/auth/login' as const,
		messageKey: 'features.signup.ui.validators.validation_messages.university_required',
	},
	[SignupSteps.UNIVERSITY_DETAIL]: {
		requiredFields: ['name', 'phone', 'birthday', 'gender', 'universityId'],
		redirectTo: '/auth/login' as const,
		messageKey: 'features.signup.ui.validators.validation_messages.missing_previous_info',
	},
	[SignupSteps.INVITE_CODE]: {
		requiredFields: [
			'name',
			'phone',
			'birthday',
			'gender',
			'universityId',
			'departmentName',
		],
		redirectTo: '/auth/login' as const,
		messageKey: 'features.signup.ui.validators.validation_messages.all_info_required',
	},
};

const getDetailedMessage = (missingFields: string[], step: SignupSteps): string => {
	const fieldNames: Record<string, string> = {
		name: i18n.t('features.signup.ui.validators.field_names.name'),
		phone: i18n.t('features.signup.ui.validators.field_names.phone'),
		birthday: i18n.t('features.signup.ui.validators.field_names.birthday'),
		gender: i18n.t('features.signup.ui.validators.field_names.gender'),
		universityId: i18n.t('features.signup.ui.validators.field_names.universityId'),
		departmentName: i18n.t('features.signup.ui.validators.field_names.departmentName'),
		instagramId: i18n.t('features.signup.ui.validators.field_names.instagramId'),
		profileImage: i18n.t('features.signup.ui.validators.field_names.profileImage'),
	};

	const missingFieldNames = missingFields.map((field) => fieldNames[field] || field).join(', ');

	console.log('missingField', missingFieldNames);

	const baseMessage = i18n.t(PAGE_VALIDATIONS[step].messageKey);

	if (missingFields.length > 0) {
		return `${baseMessage}\n누락된 정보: ${missingFieldNames}`;
	}
	return baseMessage;
};

const getRedirectRoute = (missingFields: string[]): string => {
	if (missingFields.some((field) => ['name', 'phone', 'birthday', 'gender'].includes(field))) {
		return '/auth/login';
	}

	if (missingFields.includes('universityId')) {
		return '/auth/signup/university';
	}

	if (missingFields.includes('departmentName')) {
		return '/auth/signup/university-details';
	}

	return '/auth/login';
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const hasEmptyValue = (value: any): boolean => {
	return (
		value === undefined ||
		value === null ||
		value === '' ||
		(Array.isArray(value) && value.length === 0)
	);
};

export function withSignupValidation<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	currentStep: SignupSteps,
) {
	return function ValidatedComponent(props: P) {
		const { form } = useSignupProgress();
		const { showModal, hideModal } = useModal();
		const { t } = useTranslation();
		const hasValidatedRef = useRef(false);

		useEffect(() => {
			// 이미 validation을 한 번 실행했다면 skip (무한 루프 방지)
			if (hasValidatedRef.current) {
				return;
			}

			const validation = PAGE_VALIDATIONS[currentStep];
			const missingFields: string[] = [];

			// 첫 페이지(UNIVERSITY)는 form이 비어있어도 허용
			if (currentStep === SignupSteps.UNIVERSITY && Object.keys(form).length === 0) {
				return;
			}

			// 다른 페이지에서 form이 비어있으면 로그인 페이지로 redirect
			if (currentStep !== SignupSteps.UNIVERSITY && Object.keys(form).length === 0) {
				hasValidatedRef.current = true;
				showModal({
					title: t('shareds.services.common.알림'),
					children: t('features.signup.ui.validators.validation_messages.restart_signup'),
					primaryButton: {
						text: t('shareds.services.common.확인'),
						onClick: () => {
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							router.navigate('/auth/login' as any);
							hideModal();
						},
					},
				});
				return;
			}

			for (const field of validation.requiredFields) {
				if (hasEmptyValue(form[field])) {
					missingFields.push(field);
				}
			}

			if (missingFields.length > 0) {
				hasValidatedRef.current = true; // validation 완료 표시
				const redirectRoute = getRedirectRoute(missingFields);
				const message = getDetailedMessage(missingFields, currentStep);

				showModal({
					title: t('shareds.services.common.알림'),
					children: message,
					primaryButton: {
						text: t('shareds.services.common.확인'),
						onClick: () => {
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							router.navigate(redirectRoute as any);
							hideModal();
						},
					},
				});
				return;
			}
		}, []); // mount 시에만 실행 (form 변경 시 재실행 방지)

		return <WrappedComponent {...props} />;
	};
}
