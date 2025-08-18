import { useAuth } from "@/src/features/auth";
import { isAdult } from "@/src/features/pass/utils";
import { track } from "@amplitude/analytics-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";

function KakaoLoginRedirect() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { loginWithKakao } = useAuth();

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
        .then((result) => {
          track("Signup_Route_Entered", {
            screen: "AreaSelect",
            platform: "kakao",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });

          console.log("로그인 성공:", result);

          if (result.isNewUser) {
            const birthday = result.certificationInfo?.birthday;

            if (birthday && !isAdult(birthday)) {
              track('Signup_AgeCheck_Failed', {
                birthday,
                platform: 'kakao',
                env: process.env.EXPO_PUBLIC_TRACKING_MODE
              });
              router.replace("/auth/age-restriction");
              return;
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
