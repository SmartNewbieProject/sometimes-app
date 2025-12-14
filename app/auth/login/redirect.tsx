import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { isAdult } from "@/src/features/pass/utils";
import { checkPhoneNumberBlacklist } from "@/src/features/signup/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { track } from "@/src/shared/libs/amplitude-compat";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

function KakaoLoginRedirect() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { loginWithKakao } = useAuth();
  const { showModal } = useModal();
  useEffect(() => {
    const code = params.code as string;
    const error = params.error as string;

    if (error) {
      console.log("카카오 로그인 에러:", error);
      router.replace("/auth/login");
      return;
    }

    if (code) {
      console.log("카카오 인증 코드 받음:", code);

      loginWithKakao(code)
        .then(async (result) => {
          track("Signup_Route_Entered", {
            screen: "AreaSelect",
            platform: "kakao",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });

          console.log("로그인 성공:", result);

          if (result.isNewUser) {
            const birthday = result.certificationInfo?.birthday;

            if (birthday && !isAdult(birthday)) {
              track("Signup_AgeCheck_Failed", {
                birthday,
                platform: "kakao",
                env: process.env.EXPO_PUBLIC_TRACKING_MODE,
              });
              router.replace("/auth/age-restriction");
              return;
            }

            if (result.certificationInfo?.phone) {
              try {
                const { isBlacklisted } = await checkPhoneNumberBlacklist(
                  result.certificationInfo?.phone
                );

                if (isBlacklisted) {
                  track("Signup_PhoneBlacklist_Failed", {
                    phone: result.certificationInfo?.phone,
                  });
                  showModal({
                    title: t("apps.auth.redirect.cant_register.title"),
                    children:
                      t("apps.auth.redirect.cant_register.children"),
                    primaryButton: {
                      text: "확인",
                      onClick: () => {
                        router.replace("/");
                      },
                    },
                  });
                  return;
                }
              } catch (error) {
                console.error("블랙리스트 체크 오류:", error);
                track("Signup_Error", {
                  stage: "PhoneBlacklistCheck",
                  message:
                    error instanceof Error ? error.message : String(error),
                });
                router.replace("/");
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
        .catch((error) => {
          console.log("로그인 처리 에러:", error);

          // 에러 상세 로그
          console.log("Error details:", {
            status: error.status,
            message: error.message,
            response: error.response?.data,
          });

          // 로그인 페이지로 복귀
          router.replace({
            pathname: "/auth/login",
            params: {
              error: t("apps.auth.redirect.kakao_login_error.params"),
            },
          });
        });
    } else {
      console.log("인증 코드가 없습니다.");
      router.replace("/auth/login");
    }
  }, [params?.code, params?.error]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: semanticColors.surface.background,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: semanticColors.text.secondary,
        }}
      >
        {t("apps.auth.redirect.login_loading")}
        {"\n\n"}
        {t("apps.auth.redirect.waiting")}
      </Text>
    </View>
  );
}

export default KakaoLoginRedirect;