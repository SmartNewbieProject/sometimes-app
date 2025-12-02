import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import Loading from "@/src/features/loading";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";


export default function HomeLayout() {
  const { t } = useTranslation();
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
                statusData.rejectionReason || t("apps.home.rejected"),
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
    return <Loading.Page title={t("apps.auth.layout.auth_def")} />;
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
