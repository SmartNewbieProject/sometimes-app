import { View, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
import { useEffect } from 'react';

const { useSignupProgress } = Signup;

export default function LoginScreen() {
  const { clear } = useSignupProgress();

  useEffect(() => {
    clear();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 flex flex-col h-full">
        <PalePurpleGradient />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="min-h-full" style={{
            ...platform({
              ios: () => ({
                paddingTop: 48,
                paddingHorizontal: 8,
              }),
              android: () => ({
                paddingTop: 48,
                paddingHorizontal: 8,
              }),
              web: () => ({
                paddingTop: 12,
                paddingHorizontal: 0,
              }),
            })
          }}>
            <View className={cn(
              'px-4 flex-1 flex flex-col justify-between',
              platform({
                web: () => "overflow-auto flex flex-col justify-center",
                default: () => ""
              })
            )}>
              <View className="flex-1">
                <Signup.Logo />
                <Signup.LoginForm />
              </View>

              {/* 회사 정보 푸터 */}
              <View className="w-full px-4 py-4 mt-8">
                <Text className="text-[#888] text-[10px] text-center leading-4">
                  상호명: 스마트 뉴비 | 사업장 소재지: 대전광역시 유성구 동서대로 125, S9동 202호 | 대표: 전준영 | 사업자 등록번호: 498-05-02914 | 통신판매업신고: 제 2025-대전유성-0530호 | 문의전화: 010-8465-2476 | 이메일: notify@smartnewb.com | 사업자정보
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
