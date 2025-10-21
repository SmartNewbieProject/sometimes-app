import { getUserStatus } from "@/src/features/auth/apis";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import { useCheckBusanQuery } from "@/src/features/home/queries";
import Loading from "@/src/features/loading";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function HomeLayout() {
  const { my } = useAuth();
  const [statusChecked, setStatusChecked] = useState(false);
  const { data: statusData, isLoading } = useUserStatus(my.phoneNumber);
  useEffect(() => {
    const checkApprovalStatus = async () => {
      console.log("statusData", my, statusData);
      if (!my?.phoneNumber || statusChecked || isLoading) return;

      try {
        if (statusData?.status === "pending") {
          router.replace("/auth/approval-pending");
          return;
        }

        if (statusData?.status === "rejected") {
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
        setStatusChecked(true);
      } catch (error) {
        console.error("승인 상태 확인 오류:", error);
        setStatusChecked(true);
      }
    };

    checkApprovalStatus();
  }, [my?.phoneNumber, statusChecked, isLoading]);

  if (!statusChecked) {
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
