import { tryCatch } from '@/src/shared/libs';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/shared/libs/i18n';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
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
		const rawNumber = form.studentNumber ?? '';
		const locale = i18n.language;

		// 숫자만 있는 경우 로케일에 맞는 접미사 추가
		if (/^([0][1-9]|1[0-9]|2[0-5])$/.test(rawNumber)) {
			const suffix = locale.startsWith('ja') ? '年' : '학번';
			updateForm({ studentNumber: `${rawNumber}${suffix}` });
		}

		trackSignupEvent('next_button_click', 'to_done');
		mixpanelAdapter.track('Signup_University_Details', {
			grade: form.grade,
			department: form.departmentName,
			studentNumber: `${form.studentNumber}`,
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
		const isValidGrade = !!form.grade;
		const isValidDepartment =
			!!form?.departmentName &&
			(departments.length === 0 || departments.includes(form.departmentName));
		const studentNumber = form.studentNumber ?? '';

		// 한국어: "24학번" 또는 "24"
		// 일본어: "24年"
		const isValidStudentNumber =
			/^([0][1-9]|1[0-9]|2[0-5])학번$/.test(studentNumber) ||
			/^([0][1-9]|1[0-9]|2[0-5])年$/.test(studentNumber) ||
			/^([0][1-9]|1[0-9]|2[0-5])$/.test(studentNumber);

		console.log('[UniversityDetails] Validation:', {
			isValidGrade,
			grade: form.grade,
			isValidDepartment,
			departmentName: form.departmentName,
			departmentsCount: departments.length,
			isValidStudentNumber,
			studentNumber,
			nextable: isValidGrade && isValidDepartment && isValidStudentNumber,
		});

		return isValidGrade && isValidDepartment && isValidStudentNumber;
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
