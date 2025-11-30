import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { semanticColors } from '@/src/shared/constants/colors';
import { isAdult } from "@/src/features/pass/utils";
import { checkPhoneNumberBlacklist } from "@/src/features/signup/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { track } from "@amplitude/analytics-react-native";
import useSignupProgress from "@/src/features/signup/hooks/use-signup-progress";
import Logo from "@/src/features/signup/ui/logo";
import LoginForm from "@/src/features/signup/ui/login-form";
import { platform } from "@/src/shared/libs/platform";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

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

            router.replace({
              pathname: "/auth/signup/university",
              params: {
                certificationInfo: JSON.stringify(result.certificationInfo),
              },
            });
          } else {
            router.replace("/home");
          }
        })
        .catch(() => router.replace("/auth/login"));
    }
  }, [params, loginWithPass, router, showModal]);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.surface.secondary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            platform({
              ios: () => ({
                paddingTop: 20,
                paddingBottom: 40,
              }),
              android: () => ({
                paddingTop: 20,
                paddingBottom: 40,
              }),
              web: () => ({
                paddingTop: 40,
                paddingBottom: 40,
              }),
            }),
          ]}
        >
          {/* 로고 섹션 */}
          <View style={styles.logoSection}>
            <Logo />
          </View>

          {/* 메인 콘텐츠 */}
          <View style={styles.mainContent}>
            <LoginForm />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 54,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 384, // max-w-sm
  },
});
