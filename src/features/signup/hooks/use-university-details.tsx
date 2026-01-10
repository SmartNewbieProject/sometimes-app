import { tryCatch } from '@/src/shared/libs';
import { useTranslation } from 'react-i18next';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDepartmentQuery } from '../queries';
import useChangePhase from './use-change-phase';
import { useSignupAnalytics } from './use-signup-analytics';
import useSignupProgress, { SignupSteps } from './use-signup-progress';

function useUniversityDetails() {
	const { t } = useTranslation();
	const { updateForm, form } = useSignupProgress();
	const { universityId } = useGlobalSearchParams<{
		universityId: string;
	}>();

	const [signupLoading, setSignupLoading] = useState(false);

	// URL 파라미터로 전달된 universityId를 form에 저장
	useEffect(() => {
		if (universityId && universityId !== form.universityId) {
			updateForm({ universityId });
		}
	}, [universityId, form.universityId, updateForm]);

	const { data: departments = [], isLoading } = useDepartmentQuery(
		universityId ?? form.universityId,
	);

	useChangePhase(SignupSteps.UNIVERSITY_DETAIL);

	// 애널리틱스 추적 설정
	const { trackSignupEvent } = useSignupAnalytics('university_details');

	const onNext = async (fallback: () => void) => {
		trackSignupEvent('next_button_click', 'to_done');
		mixpanelAdapter.track('Signup_University_Details', {
			department: form.departmentName,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});

		setSignupLoading(true);
		await tryCatch(async () => {
			setSignupLoading(false);
			trackSignupEvent('next_button_click', 'to_instagram_id');
			fallback();
		});
	};

	const validateUniversityForm = (): boolean => {
		const isValidDepartment =
			!!form?.departmentName &&
			(departments.length === 0 || departments.includes(form.departmentName));

		console.log('[UniversityDetails] Validation:', {
			isValidDepartment,
			departmentName: form.departmentName,
			departmentsCount: departments.length,
			nextable: isValidDepartment,
		});

		return isValidDepartment;
	};
	const nextable = validateUniversityForm();

	const onBackPress = (fallback: () => void) => {
		// 뒤로가기 시 입력한 데이터는 유지 (삭제하지 않음)
		fallback();
		return true;
	};

	return {
		signupLoading,
		onBackPress,
		onNext,
		nextable,
	};
}

export default useUniversityDetails;
