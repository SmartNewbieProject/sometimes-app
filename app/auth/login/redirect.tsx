import { useAuth } from "@/src/features/auth";
import { checkPhoneNumberBlacklist } from "@/src/features/signup/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { track } from "@amplitude/analytics-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";

function KakaoLoginRedirect() {
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
          });

          console.log("로그인 성공:", result);

          if (result.isNewUser) {
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
                    title: "가입 제한",
                    children:
                      "신고 접수 또는 프로필 정보 부적합 등의 사유로 가입이 제한되었습니다.",
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
              pathname: "/auth/signup/area",
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
              error: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
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
        backgroundColor: "#ffffff",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "#333333",
        }}
      >
        로그인 처리 중입니다...
        {"\n\n"}
        잠시만 기다려주세요.
      </Text>
    </View>
  );
}

export default KakaoLoginRedirect;
