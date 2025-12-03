import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function ProfileImgEditWaitingScreen() {
  const { t } = useTranslation();
  const { my } = useAuth();
  const { data: statusData } = useUserStatus(my.phoneNumber);
  const handleGoToLogin = async () => {
    router.push("/home");
  };
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/home");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center items-center px-6 py-12">
          {/* SOMETIME 로고 */}
          <View className="mb-8">
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 메인 이미지 */}
          <View className="mb-8 relative w-[284px] h-[284px] ">
            <View className="bg-brand-primary rounded-full blur-[2px] w-[284px] h-[284px] absolute top-0 left-0 bottom-0 right-0" />
            <View className="bg-brand-primary rounded-full blur-[2px] w-[254px] h-[254px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <View className="bg-surface-background rounded-full  w-[242px] h-[242px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <Image
              source={
                statusData?.profileImage ??
                require("@/assets/images/signup-pending.png")
              }
              style={{
                width: 242,
                height: 242,
                position: "absolute",
                top: 21,
                left: 21,
              }}
              contentFit="contain"
              className="rounded-full "
            />
          </View>

          {/* 제목 */}
          <View className="w-full mb-4 items-center">
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              className="text-center"
            >
              {t('features.mypage.profile_status.waiting.title')}
            </Text>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              className="text-center mt-1"
            >
              {t('features.mypage.profile_status.waiting.reviewing')}
            </Text>
          </View>

          {/* 설명 */}
          <View className="w-full mb-8 items-center">
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              className="text-center"
            >
              {t('features.mypage.profile_status.waiting.push_notify')}
            </Text>
          </View>

          {/* 승인 대기 카드 */}
          <View className="w-full mb-8">
            <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                  <Text size="12" textColor="white" weight="bold">
                    ⏱
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    className="mb-1"
                  >
                    {t('features.mypage.profile_status.waiting.status_title')}
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    {t('features.mypage.profile_status.waiting.time_info')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="w-full px-6 pb-8">
        <Button
          variant="primary"
          size="md"
          onPress={handleGoToLogin}
          className="w-full py-4 rounded-2xl"
        >
          {t('features.mypage.profile_status.waiting.go_home')}
        </Button>
      </View>
    </DefaultLayout>
  );
}
