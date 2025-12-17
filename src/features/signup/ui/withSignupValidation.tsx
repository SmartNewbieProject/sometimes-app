import { useModal } from "@/src/shared/hooks/use-modal";
import { router } from "expo-router";
import type React from "react";
import { useEffect, useRef } from "react";
import { type SignupForm, SignupSteps, useSignupProgress } from "../hooks";

interface PageValidation {
  requiredFields: (keyof SignupForm)[];
  redirectTo: string;

  message: string;
}

const PAGE_VALIDATIONS: Record<SignupSteps, PageValidation> = {
  [SignupSteps.UNIVERSITY]: {
    requiredFields: [],
    redirectTo: "/auth/login" as const,

    message: "대학 선택을 위해 먼저 기본 정보를 입력해주세요",
  },
  [SignupSteps.UNIVERSITY_DETAIL]: {
    requiredFields: ["name", "phone", "birthday", "gender", "universityId"],
    redirectTo: "/auth/login" as const,

    message: "앞선 정보 입력에서 누락된 부분이 있어요",
  },
  [SignupSteps.INSTAGRAM]: {
    requiredFields: [
      "name",
      "phone",
      "birthday",
      "gender",
      "universityId",
      "departmentName",
      "grade",
      "studentNumber",
    ],
    redirectTo: "/auth/login" as const,

    message: "앞선 정보 입력에서 누락된 부분이 있어요",
  },
  [SignupSteps.PROFILE_IMAGE]: {
    requiredFields: [
      "name",
      "phone",
      "birthday",
      "gender",
      "universityId",
      "departmentName",
      "grade",
      "studentNumber",
      "instagramId",
    ],
    redirectTo: "/auth/login" as const,

    message: "프로필 사진 설정을 위해 먼저 인스타그램 계정을 연동해주세요.",
  },
  [SignupSteps.INVITE_CODE]: {
    requiredFields: [
      "name",
      "phone",
      "birthday",
      "gender",
      "universityId",
      "departmentName",
      "grade",
      "studentNumber",
      "instagramId",
      "profileImages"
    ],
    redirectTo: "/auth/login" as const,

    message: "회원가입에 필요한 정보를 모두 입력하셔야 회원가입 신청이 가능해요.",
  }
};

const getDetailedMessage = (
  missingFields: string[],
  step: SignupSteps
): string => {
  const fieldNames: Record<string, string> = {
    name: "이름",
    phone: "전화번호",
    birthday: "생년월일",
    gender: "성별",
    universityId: "대학 정보",
    departmentName: "학과명",
    grade: "학년",
    studentNumber: "학번",
    instagramId: "인스타그램 계정",
    profileImage: "프로필 사진"
  };

  const missingFieldNames = missingFields
    .map((field) => fieldNames[field] || field)
    .join(", ");

  console.log("missingField", missingFieldNames);

  const baseMessage = PAGE_VALIDATIONS[step].message;

  if (missingFields.length > 0) {
    return `${baseMessage}\n누락된 정보: ${missingFieldNames}`;
  }
  return baseMessage;
};

const getRedirectRoute = (missingFields: string[]): string => {
  if (
    missingFields.some((field) =>
      ["name", "phone", "birthday", "gender"].includes(field)
    )
  ) {
    return "/auth/login";
  }

  if (missingFields.includes("universityId")) {
    return "/auth/signup/university";
  }

  if (
    missingFields.some((field) =>
      ["departmentName", "grade", "studentNumber"].includes(field)
    )
  ) {
    return "/auth/signup/university-details";
  }

  if (missingFields.includes("instagramId")) {
    return "/auth/signup/instagram";
  }

  if (missingFields.includes("profileImages")) {
    return "/auth/signup/profile-image"
  }

  return "/auth/login";
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const hasEmptyValue = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
};

export function withSignupValidation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  currentStep: SignupSteps
) {
  return function ValidatedComponent(props: P) {
    const { form } = useSignupProgress();
    const { showModal, hideModal } = useModal();
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
          title: "알림",
          children: "회원가입을 처음부터 시작해주세요",
          primaryButton: {
            text: "확인",
            onClick: () => {
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              router.navigate("/auth/login" as any);
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
          title: "알림",
          children: message,
          primaryButton: {
            text: "확인",
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
