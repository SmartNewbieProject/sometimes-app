import { sendEvent, sendPageView } from "@/src/shared/utils";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { usePathname } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * 회원가입 페이지에서 사용할 애널리틱스 훅
 * 페이지 뷰 및 회원가입 단계 이벤트를 추적합니다. (GA + Mixpanel)
 *
 * @param step 현재 회원가입 단계 (terms, account, phone 등)
 * @returns 이벤트 추적 함수
 */
export const useSignupAnalytics = (step: string) => {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === "web") {
      sendPageView(pathname);
      sendEvent("signup_step_view", "signup", step);
    }
  }, [pathname, step]);

  /**
   * 회원가입 과정에서 특정 액션 이벤트 추적 (GA + Mixpanel)
   *
   * @param action 액션 이름 (예: 'signup_error', 'signup_complete')
   * @param detail 추가 정보 (선택 사항)
   */
  const trackSignupEvent = (action: string, detail?: string) => {
    if (Platform.OS === "web") {
      sendEvent(action, "signup", `${step}${detail ? `:${detail}` : ""}`);
    }

    mixpanelAdapter.track(`Signup_${step}_${action}`, {
      step,
      action,
      detail,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
  };

  return { trackSignupEvent };
};
