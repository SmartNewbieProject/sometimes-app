import { tryCatch } from "@/src/shared/libs";
import { track } from "@amplitude/analytics-react-native";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { useDepartmentQuery } from "../queries";
import useChangePhase from "./use-change-phase";
import { useSignupAnalytics } from "./use-signup-analytics";
import useSignupProgress, { SignupSteps } from "./use-signup-progress";

function useUniversityDetails() {
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
    universityId ?? form.universityId
  );

  useChangePhase(SignupSteps.UNIVERSITY_DETAIL);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university_details");

  const onNext = async (fallback: () => void) => {
    const rawNumber = form.studentNumber ?? "";

    if (/^([0][1-9]|1[0-9]|2[0-5])$/.test(rawNumber)) {
      updateForm({ studentNumber: `${rawNumber}학번` });
    }

    trackSignupEvent("next_button_click", "to_done");
    track("Singup_university_details", {
      grade: form.grade,
      department: form.departmentName,
      studentNumber: `${form.studentNumber}`,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    setSignupLoading(true);
    await tryCatch(async () => {
      setSignupLoading(false);
      trackSignupEvent("next_button_click", "to_instagram_id");
      fallback();
    });
  };

  const validateUniversityForm = (): boolean => {
    const isValidGrade = !!form.grade;
    const isValidDepartment = departments.includes(
      form?.departmentName ?? "없음"
    );
    const studentNumber = form.studentNumber ?? "";

    const isValidStudentNumber =
      /^([0][1-9]|1[0-9]|2[0-5])학번$/.test(studentNumber) ||
      /^([0][1-9]|1[0-9]|2[0-5])$/.test(studentNumber);

    return isValidGrade && isValidDepartment && isValidStudentNumber;
  };
  const nextable = validateUniversityForm();

  const onBackPress = (fallback: () => void) => {
    updateForm({
      departmentName: undefined,
      grade: undefined,
      studentNumber: undefined,
    });
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
