import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import Loading from "@/src/features/loading";
import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";


export default function HomeLayout() {
  const { t } = useTranslation();
  const { my, accessToken, queryProps } = useAuth();
  const [statusChecked, setStatusChecked] = useState(true); // 기본 true로 설정
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // MyDetails Query가 완료될 때까지 기다림
  const myDetailsReady = !queryProps.my.isLoading && my?.phoneNumber;
  const { data: statusData, isLoading, error } = useUserStatus(myDetailsReady ? my.phoneNumber : undefined);

  useEffect(() => {
    console.log("🔍 [HomeLayout] Status check started", {
      myDetailsReady,
      isLoading,
      hasMy: !!my,
      hasPhoneNumber: !!my?.phoneNumber,
      statusData: statusData?.status,
      error: error?.message,
      statusChecked
    });

    // 5초 타임아웃 설정
    timeoutRef.current = setTimeout(() => {
      console.log("⏰ [HomeLayout] 5s timeout - forcing proceed");
      setIsTimeout(true);
      setStatusChecked(true);
    }, 5000);

    const checkApprovalStatus = async () => {
      try {
        // 기본 정보가 없으면 2초 후 강제 진행
        if (!myDetailsReady) {
          console.log("⏳ [HomeLayout] Basic info loading - will force proceed in 2s");
          setTimeout(() => {
            if (!myDetailsReady) {
              console.log("⚡ [HomeLayout] No basic info - forcing statusChecked");
              setStatusChecked(true);
            }
          }, 2000);
          return;
        }

        // API 로딩 중이면 기다림
        if (isLoading) {
          console.log("⏳ [HomeLayout] API loading");
          return;
        }

        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        console.log("✅ [HomeLayout] API response check:", { status: statusData?.status, error });

        // 에러가 있어도 진행
        if (error) {
          console.log("❌ [HomeLayout] API error but proceeding:", error.message);
          setStatusChecked(true);
          return;
        }

        // 승인 상태 확인 - pending, rejected 상태도 홈으로 진행
        if (statusData?.status === "pending") {
          console.log("⏸️ [HomeLayout] Pending status - proceeding to home");
          setStatusChecked(true);
          return;
        }

        if (statusData?.status === "rejected") {
          console.log("🚫 [HomeLayout] Rejected status - proceeding to home");
          setStatusChecked(true);
          return;
        }

        // 그 외 모든 경우 진행
        console.log("🎉 [HomeLayout] Normal status - proceeding to home");
        setStatusChecked(true);
      } catch (error) {
        console.error("💥 [HomeLayout] Exception occurred:", error);
        setStatusChecked(true); // 예외 발생해도 진행
      }
    };

    checkApprovalStatus();

    // 클린업
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [myDetailsReady, statusData?.status, isLoading, error]);

  // 타임아웃 발생 시 강제 진행
  const shouldShowLoading = !statusChecked && !isTimeout;

  console.log("🎯 [HomeLayout] Final state:", {
    shouldShowLoading,
    statusChecked,
    isTimeout,
    myDetailsReady,
    isLoading
  });

  if (shouldShowLoading) {
    return <Loading.Page title={t("features.home.ui.layout.loading_user_info")} />;
  }

  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
