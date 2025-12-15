import type { Router } from "expo-router";
// src/features/signup/utils/signup-validators.ts
import { Platform } from "react-native";
import type { SignupForm } from "../hooks/use-signup-progress";

export function buildSignupForm(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  userForm: any,
  images: (string | null | undefined)[]
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
    showErrorModal: (message: string, type: "announcement" | "error") => void;
  }
): Promise<boolean> {
  if (Platform.OS === "ios" && loginTypeStorage === "apple") {
    if (appleUserIdFromStorage) {
      signupForm.appleId = appleUserIdFromStorage;
      return true;
    }
    await removeAppleUserId();
    await removeLoginType();
    showErrorModal("애플 로그인 정보가 없습니다.", "announcement");
    router.push("/auth/login");
    return false;
  }

  if (
    Platform.OS === "web" &&
    sessionStorage.getItem("loginType") === "apple"
  ) {
    const appleIdFromSession = sessionStorage.getItem("appleUserId");
    if (appleIdFromSession) {
      signupForm.appleId = appleIdFromSession;
      return true;
    }
    sessionStorage.removeItem("appleUserId");
    sessionStorage.removeItem("loginType");
    showErrorModal("애플 로그인 정보가 없습니다.", "announcement");
    router.push("/auth/login");
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
    track,
    showErrorModal,
    removeLoginType,
  }: {
    router: Router;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    apis: any;
    trackSignupEvent: (event: string, detail?: string) => void;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    track: (event: string, data?: any) => void;
    showErrorModal: (message: string, type: "announcement" | "error") => void;
    removeLoginType: () => Promise<void>;
  }
): Promise<boolean> {
  if (!signupForm.phone) {
    showErrorModal("휴대폰 번호가 없습니다", "announcement");
    trackSignupEvent("signup_error", "missing_phone");
    track("Signup_profile_image_error", { error: "휴대폰 번호가 없습니다.", env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/auth/login");
    return false;
  }

  const { exists } = await apis.checkPhoneNumberExists(signupForm.phone);
  if (exists) {
    showErrorModal("이미 가입된 사용자입니다", "announcement");
    trackSignupEvent("signup_error", "phone_already_exists");
    track("Signup_profile_image_error", { error: "이미 가입된 사용자입니다", env: process.env.EXPO_PUBLIC_TRACKING_MODE });

    if (Platform.OS === "ios") await removeLoginType();
    else if (Platform.OS === "web") sessionStorage.removeItem("loginType");

    router.push("/auth/login");
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
    showErrorModal: (message: string, type: "announcement" | "error") => void;
  }
): boolean {
  if (!signupForm.universityId || !signupForm.departmentName) {
    showErrorModal("학교와 학과 정보가 필요해요.", "announcement");
    router.navigate("/auth/signup/university");
    return false;
  }
  return true;
}

export async function processSignup(
  signupForm: SignupForm,
  {
    router,
    apis,
    track,
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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    track: (event: string, data?: any) => void;
    trackSignupEvent: (event: string, detail?: string) => void;
    trackKpiEvent?: (event: string, data?: any) => void;
    removeLoginType: () => Promise<void>;
    updateToken: (accessToken: string, refreshToken: string) => Promise<void>;
    clearSignupForm: () => void;
    identifyUser?: (userId: string) => void;
  }
): Promise<void> {
  const response = await apis.signup(signupForm);

  console.log("[processSignup] signup response:", JSON.stringify(response, null, 2));

  // 프로필 완성률 계산
  const profileFields = ['phone', 'universityId', 'profileImages', 'name', 'birthday', 'gender', 'departmentName', 'grade', 'studentNumber', 'instagramId'];
  const completedFields = profileFields.filter(field => {
    if (field === 'profileImages') {
      return signupForm.profileImages?.some(img => img !== null) || false;
    }
    return signupForm[field as keyof typeof signupForm] !== undefined && signupForm[field as keyof typeof signupForm] !== null && signupForm[field as keyof typeof signupForm] !== '';
  });

  const completionRate = Math.round((completedFields.length / profileFields.length) * 100);

  // KPI 이벤트: 프로필 완성도 업데이트 (최초 가입 시)
  if (trackKpiEvent) {
    trackKpiEvent('Profile_Completion_Updated', {
      profile_completion_rate: completionRate,
      completed_fields: completedFields,
    });

    // KPI 이벤트: 가입 완료
    trackKpiEvent('Signup_Completed', {
      profile_completion_rate: completionRate,
      total_duration: Date.now() - (signupForm.signupStartTime || Date.now())
    });
  }

  // 기존 이벤트 호환성
  track("Signup_profile_image", { success: true, env: process.env.EXPO_PUBLIC_TRACKING_MODE });
  trackSignupEvent("signup_complete");

  if (Platform.OS === "ios") await removeLoginType();
  else if (Platform.OS === "web") sessionStorage.removeItem("loginType");

  // 토큰 저장 (회원가입 API가 토큰을 반환하므로 바로 로그인 처리)
  await updateToken(response.accessToken, response.refreshToken);

  // 사용자 식별 (analytics)
  if (identifyUser && response.id) {
    identifyUser(response.id);
  }

  // 회원가입 폼 데이터 클리어
  clearSignupForm();

  console.log("[processSignup] signup & login completed, navigating to /home");

  // 바로 홈으로 이동 (done 페이지 스킵)
  router.replace("/home");
}
