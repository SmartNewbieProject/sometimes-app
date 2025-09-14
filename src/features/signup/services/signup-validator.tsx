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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    router: any;
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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    router: any;
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
    track("Signup_profile_image_error", { error: "휴대폰 번호가 없습니다." });
    router.push("/auth/login");
    return false;
  }

  const { exists } = await apis.checkPhoneNumberExists(signupForm.phone);
  if (exists) {
    showErrorModal("이미 가입된 사용자입니다", "announcement");
    trackSignupEvent("signup_error", "phone_already_exists");
    track("Signup_profile_image_error", { error: "이미 가입된 사용자입니다" });

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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    router: any;
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
    removeLoginType,
  }: {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    router: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    apis: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    track: (event: string, data?: any) => void;
    trackSignupEvent: (event: string, detail?: string) => void;
    removeLoginType: () => Promise<void>;
  }
): Promise<void> {
  await apis.signup(signupForm);
  track("Signup_profile_image", { success: true });
  trackSignupEvent("signup_complete");

  if (Platform.OS === "ios") await removeLoginType();
  else if (Platform.OS === "web") sessionStorage.removeItem("loginType");

  router.push("/auth/signup/done");
}
