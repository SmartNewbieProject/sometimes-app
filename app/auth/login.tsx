import { View, ScrollView } from 'react-native';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { useEffect } from 'react';
import { BusinessInfo } from '@/src/shared/ui/business-info/business-info';

const { useSignupProgress } = Signup;

export default function LoginScreen() {
  const { clear } = useSignupProgress();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <View className="flex-1" style={{ backgroundColor: '#F7F3FF' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-4" style={{
          ...platform({
            ios: () => ({
              paddingTop: 80,
              paddingBottom: 40,
            }),
            android: () => ({
              paddingTop: 80,
              paddingBottom: 40,
            }),
            web: () => ({
              paddingTop: 40,
              paddingBottom: 40,
            }),
          })
        }}>
          {/* 로고 섹션 */}
          <View className="items-center mb-8">
            <Signup.Logo />
          </View>

          {/* 메인 콘텐츠 */}
          <View className="flex-1 w-full max-w-sm">
            <Signup.LoginForm />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
