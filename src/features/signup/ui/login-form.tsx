import { View, TouchableOpacity } from "react-native";
import { Text, Button } from "@/src/shared/ui";
import { usePortOneLogin } from "@/src/features/pass";
import { useAuth } from "../../auth";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import UniversityLogos from "./university-logos";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";

export default function LoginForm() {
  const { isAuthorized } = useAuth();

  const { startPortOneLogin, isLoading, error, clearError } = usePortOneLogin({
    onSuccess: (isNewUser) => console.log(isNewUser ? 'New user flow' : 'Existing user'),
    onError: (error) => console.error('Login failed', error),
  });

  const onPressPassLogin = async () => {
    clearError(); // 이전 에러 메시지 제거
    await startPortOneLogin();
  };

  useFocusEffect(useCallback(
    () => {
      if (isAuthorized) router.push('/home');
    }, [isAuthorized]
  ));

  // 토큰 저장 후 즉시 홈으로 이동하도록 감지
  useEffect(() => {
    if (isAuthorized) {
      console.log('인증 상태 변화 감지, 홈으로 이동');
      router.replace('/home');
    }
  }, [isAuthorized]);
  // 토큰 저장 후 즉시 홈으로 이동하도록 감지
  useEffect(() => {
    if (isAuthorized) {
      console.log('인증 상태 변화 감지, 홈으로 이동');
      router.replace('/home');
    }
  }, [isAuthorized]);

  return (
    <View className="flex flex-col flex-1 items-center">
      {/* 대학교 로고 애니메이션 */}
      <UniversityLogos logoSize={48} />

      {/* 회원가입 및 로그인 버튼 */}
      <View className="flex flex-col">
        <View className="w-full max-w-xs">
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            className="py-4 rounded-full min-w-[280px] min-h-[60px]"
          >
            <Text className="text-white text-center text-md h-[40px]">
              {isLoading ? 'PASS 인증 중...' : '회원가입 및 로그인'}
            </Text>
          </Button>
        </View>
      </View>

      {/* 에러 메시지 */}
      {error && (
        <TouchableOpacity
          className="w-full px-6 mt-4"
          onPress={clearError}
        >
          <View className="w-full px-4 py-2 bg-red-50 rounded-md">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
            <Text className="text-red-400 text-xs text-center mt-1">탭하여 닫기</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 약관 동의 안내 */}
      <View className="w-full px-6 mt-6">
        <PrivacyNotice />
      </View>
    </View>
  )
}
