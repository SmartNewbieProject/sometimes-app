import { View, ScrollView } from 'react-native';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { useEffect } from 'react';
import { BusinessInfo } from '@/src/shared/ui/business-info/business-info';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

const { useSignupProgress } = Signup;

export default function LoginScreen() {
  const { clear } = useSignupProgress();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { loginWithPass } = useAuth();

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    const identityVerificationId = params.identityVerificationId as string;
    if (identityVerificationId) {
      loginWithPass(identityVerificationId).then(result => {
        if (result.isNewUser) {
          router.replace({
            pathname: '/auth/signup/university',
            params: { certificationInfo: JSON.stringify(result.certificationInfo) },
          });
        } else {
          router.replace('/home');
        }
      }).catch(() => router.replace('/auth/login'));
    }
  }, [params, loginWithPass, router]);

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
