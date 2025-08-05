import { useAuth } from "@/src/features/auth";
import { useSignupProgress } from "@/src/features/signup/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

function KakaoLoginRedirect() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { form } = useSignupProgress();
  const { loginWithKakao } = useAuth();
  useEffect(() => {
    const code = params.code as string;
    if (code && !form.kakaoId) {
      loginWithKakao(code)
        .then((result) => {
          if (result.isNewUser) {
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
        .catch(() => router.replace("/auth/login"));
    }
  }, [params?.code, form.kakaoId]);

  return null;
}

const styles = StyleSheet.create({});

export default KakaoLoginRedirect;
