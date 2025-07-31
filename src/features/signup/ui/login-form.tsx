import {
  MobileIdentityVerification,
  usePortOneLogin,
} from "@/src/features/pass";
import { Button, Text } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import { Platform, TouchableOpacity, View } from "react-native";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";
import UniversityLogos from "./university-logos";

export default function LoginForm() {
  const {
    startPortOneLogin,
    isLoading,
    error,
    clearError,
    showMobileAuth,
    mobileAuthRequest,
    handleMobileAuthComplete,
    handleMobileAuthError,
  } = usePortOneLogin();

  const onPressPassLogin = async () => {
    track("Signup_Init", { test: true });

    clearError();
    await startPortOneLogin();
  };

  // 모바일에서 PASS 인증 화면 표시
  if (showMobileAuth && mobileAuthRequest && Platform.OS !== "web") {
    return (
      <MobileIdentityVerification
        request={mobileAuthRequest}
        onComplete={handleMobileAuthComplete}
        onError={handleMobileAuthError}
      />
    );
  }

  return (
    <View className="flex flex-col flex-1 items-center">
      {/* 대학교 로고 애니메이션 */}
      <UniversityLogos logoSize={64} />

      {/* 회원가입 및 로그인 버튼 */}
      <View className="flex flex-col">
        <View className="w-full max-w-xs mt-6">
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            className="py-4 rounded-full min-w-[280px] min-h-[60px]"
          >
            <Text className="text-white text-center text-[18px] h-[40px]">
              {isLoading ? "PASS 인증 중..." : "회원가입 및 로그인"}
            </Text>
          </Button>
        </View>
      </View>

      {/* 에러 메시지 */}
      {error && (
        <TouchableOpacity className="w-full px-6 mt-4" onPress={clearError}>
          <View className="w-full px-4 py-2 bg-red-50 rounded-md">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
            <Text className="text-red-400 text-xs text-center mt-1">
              탭하여 닫기
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 약관 동의 안내 */}
      <View className="w-full px-6 mt-12">
        <PrivacyNotice />
      </View>
    </View>
  );
}
