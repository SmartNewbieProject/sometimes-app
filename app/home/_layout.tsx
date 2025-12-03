import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import Loading from "@/src/features/loading";
import { Stack, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View } from "react-native";

export default function HomeLayout() {
  const { my, accessToken, queryProps } = useAuth();
  const [statusChecked, setStatusChecked] = useState(true); // 기본 true로 설정
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // MyDetails Query가 완료될 때까지 기다림
  const myDetailsReady = !queryProps.my.isLoading && my?.phoneNumber;
  const { data: statusData, isLoading, error } = useUserStatus(myDetailsReady ? my.phoneNumber : undefined);

  useEffect(() => {
    console.log("🔍 [HomeLayout] 상태 체크 시작", {
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
      console.log("⏰ [HomeLayout] 5초 타임아웃 - 강제 진행");
      setIsTimeout(true);
      setStatusChecked(true);
    }, 5000);

    const checkApprovalStatus = async () => {
      try {
        // 기본 정보가 없으면 2초 후 강제 진행
        if (!myDetailsReady) {
          console.log("⏳ [HomeLayout] 기본 정보 로딩 중 - 2초 후 강제 진행 예정");
          setTimeout(() => {
            if (!myDetailsReady) {
              console.log("⚡ [HomeLayout] 기본 정보 없음 - 강제로 statusChecked 설정");
              setStatusChecked(true);
            }
          }, 2000);
          return;
        }

        // API 로딩 중이면 기다림
        if (isLoading) {
          console.log("⏳ [HomeLayout] API 로딩 중");
          return;
        }

        // 타임아웃 정리
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        console.log("✅ [HomeLayout] API 응답 확인:", { status: statusData?.status, error });

        // 에러가 있어도 진행
        if (error) {
          console.log("❌ [HomeLayout] API 에러 발생하지만 진행:", error.message);
          setStatusChecked(true);
          return;
        }

        // 승인 상태 확인
        if (statusData?.status === "pending") {
          console.log("⏸️ [HomeLayout] 승인 대기 상태");
          router.replace("/auth/approval-pending");
          return;
        }

        if (statusData?.status === "rejected") {
          console.log("🚫 [HomeLayout] 승인 거절 상태");
          router.replace({
            pathname: "/auth/approval-rejected",
            params: {
              phoneNumber: my.phoneNumber,
              rejectionReason:
                statusData.rejectionReason || "승인이 거절되었습니다.",
            },
          });
          return;
        }

        // 그 외 모든 경우 진행
        console.log("🎉 [HomeLayout] 정상 상태 - 홈으로 진행");
        setStatusChecked(true);
      } catch (error) {
        console.error("💥 [HomeLayout] 예외 발생:", error);
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

  console.log("🎯 [HomeLayout] 최종 상태:", {
    shouldShowLoading,
    statusChecked,
    isTimeout,
    myDetailsReady,
    isLoading
  });

  if (shouldShowLoading) {
    return <Loading.Page title="사용자 정보를 확인하고 있어요..." />;
  }

  return (
    <View className="flex-1">
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
