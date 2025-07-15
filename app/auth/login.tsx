import {View, ScrollView} from 'react-native';
import Signup from '@features/signup';
import {platform} from '@shared/libs/platform';
import {useEffect} from 'react';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useAuth} from '@/src/features/auth/hooks/use-auth';
import {checkPhoneNumberBlacklist} from '@/src/features/signup/apis';
import {useModal} from '@/src/shared/hooks/use-modal';
import {isAdult} from '@/src/features/pass/utils';

const {useSignupProgress} = Signup;

export default function LoginScreen() {
  const {clear} = useSignupProgress();
  const params = useLocalSearchParams();
  const router = useRouter();
  const {loginWithPass} = useAuth();
  const {showModal} = useModal();

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    const identityVerificationId = params.identityVerificationId as string;
    if (identityVerificationId) {
      loginWithPass(identityVerificationId).then(async result => {
        if (result.isNewUser) {
          if (result.certificationInfo?.birthday) {
            const {birthday} = result.certificationInfo;

            if (!isAdult(birthday)) {
              router.replace('/auth/age-restriction');
              return;
            }
          }

          if (result.certificationInfo?.phone) {
            try {
              const {isBlacklisted} = await checkPhoneNumberBlacklist(result.certificationInfo.phone);

              if (isBlacklisted) {
                showModal({
                  title: "가입 제한",
                  children: "신고 접수 또는 프로필 정보 부적합 등의 사유로 가입이 제한되었습니다.",
                  primaryButton: {
                    text: "확인",
                    onClick: () => {
                      router.replace('/');
                    }
                  }
                });
                return;
              }
            } catch (error) {
              console.error('블랙리스트 체크 실패:', error);
            }
          }

          router.replace({
            pathname: '/auth/signup/university',
            params: {certificationInfo: JSON.stringify(result.certificationInfo)},
          });
        } else {
          router.replace('/home');
        }
      }).catch(() => router.replace('/auth/login'));
    }
  }, [params, loginWithPass, router, showModal]);

  return (
      <View className="flex-1" style={{backgroundColor: '#F7F3FF'}}>
        <ScrollView
            className="flex-1"
            contentContainerStyle={{flexGrow: 1}}
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
              <Signup.Logo/>
            </View>

            {/* 메인 콘텐츠 */}
            <View className="flex-1 w-full max-w-sm">
              <Signup.LoginForm/>
            </View>
          </View>
        </ScrollView>
      </View>
  );
}
