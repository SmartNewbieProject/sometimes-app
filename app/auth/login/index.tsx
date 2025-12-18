import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { isAdult } from "@/src/features/pass/utils";
import { checkPhoneNumberBlacklist } from "@/src/features/signup/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Button } from "@/src/shared/ui/button";
import { track } from "@/src/shared/libs/amplitude-compat";
import Signup from "@features/signup";
import { platform } from "@shared/libs/platform";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { useSignupProgress } = Signup;

export default function LoginScreen() {
  const { clear } = useSignupProgress();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { loginWithPass } = useAuth();
  const { showModal } = useModal();
  useEffect(() => {
    const identityVerificationId = params.identityVerificationId as string;
    if (identityVerificationId) {
      loginWithPass(identityVerificationId)
        .then(async (result) => {
          if (result.isNewUser) {
            const birthday = result.certificationInfo?.birthday;
            const phone = result.certificationInfo?.phone;
            if (birthday && !isAdult(birthday)) {
              track("Signup_AgeCheck_Failed", {
                birthday,
                platform: "pass",
                env: process.env.EXPO_PUBLIC_TRACKING_MODE,
              });
              router.replace("/auth/age-restriction");
              return;
            }
            if (phone) {
              try {
                const { isBlacklisted } = await checkPhoneNumberBlacklist(
                  phone
                );

                if (isBlacklisted) {
                  track("Signup_PhoneBlacklist_Failed", {
                    phone: phone,
                    platform: "pass",
                    env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                  });
                  showModal({
                    title: "가입 제한",
                    children:
                      "신고 접수 또는 프로필 정보 부적합 등의 사유로 가입이 제한되었습니다.",
                    primaryButton: {
                      text: "확인",
                      onClick: () => {
                        router.replace("/auth/login");
                      },
                    },
                  });
                  return;
                }
              } catch (error) {
                console.error("블랙리스트 체크 오류:", error);
                track("Signup_Error", {
                  stage: "PhoneBlacklistCheck",
                  platform: "pass",
                  message:
                    error instanceof Error ? error.message : String(error),
                  env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                });
                router.replace("/auth/login");
                return;
              }
            }

            // 보안: certificationInfo를 AsyncStorage에 저장 (URL에 노출 방지)
            await AsyncStorage.setItem(
              'signup_certification_info',
              JSON.stringify(result.certificationInfo)
            );

            router.replace("/auth/signup/university");
          } else {
            router.replace("/home");
          }
        })
        .catch(() => router.replace("/auth/login"));
    }
  }, [params, loginWithPass, router, showModal]);

  useEffect(() => {
    clear();
    // 회원가입 관련 storage 초기화
    AsyncStorage.removeItem('signup_session');
    AsyncStorage.removeItem('signup_certification_info');
  }, [clear]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* 로고 섹션 */}
          <View style={styles.logoSection}>
            <Signup.Logo />
          </View>

          {/* 메인 콘텐츠 */}
          <View style={styles.mainContent}>
            <Signup.LoginForm />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 54,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 384,
    alignItems: 'center',
  },
});
