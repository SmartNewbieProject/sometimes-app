import { View, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
import { useEffect } from 'react';
import { BusinessInfo } from '@/src/shared/ui/business-info/business-info';

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
                <BusinessInfo />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
