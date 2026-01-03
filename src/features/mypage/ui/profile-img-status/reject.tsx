// DEPRECATED: 사진 거절 페이지가 사진관리 페이지로 통합됨
// 이 파일은 더 이상 사용되지 않습니다. (2025-12-14)
// 거절된 사진은 이제 app/profile/photo-management.tsx에서 확인할 수 있습니다.

/*
import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConfirmProfileImageReview } from "@/src/features/mypage/hooks/use-confirm-profile-image-review";
import { useTranslation } from "react-i18next";

export default function ProfileImgEditRejectScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || t('features.mypage.profile_status.reject.default_reason');

  const { mutateAsync, isPending } = useConfirmProfileImageReview();

  const handleReapply = async () => {
    try {
      await mutateAsync();
      router.push({ pathname: "/profile-edit/profile" });
    } catch (e) {}
  };

  const handleContactSupport = () => {
    Linking.openURL(
      "https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng=="
    );
  };

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
      >
        <View className="flex-1 items-center px-6 pb-12">
          {/* SOMETIME 로고 *\/}
          <View className="mt-[10px] mb-[28px]">
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 *\/}
          <View className="items-center  relative ">
            <View style={{ position: "absolute", left: 0 }}>
              <View
                style={{
                  width: 253,
                  height: 253,
                  borderRadius: 253,
                  top: 0,
                  left: 0,

                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 193,
                  height: 193,
                  borderRadius: 223,

                  backgroundColor: semanticColors.surface.background,
                  top: 30,
                  left: 30,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 30,
                  height: 196,
                  top: 30,
                  left: 111.5,
                  transform: [
                    {
                      rotate: "-45deg",
                    },
                  ],
                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
            </View>

            <Image
              source={require("@assets/images/limit-age.webp")}
              style={{ width: 259, height: 259, top: 30, left: 30 }}
              className="mb-6"
            />
          </View>

          {/* 제목 *\/}
          <View className="w-full mb-4">
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              className="text-left"
            >
              {t('features.mypage.profile_status.reject.title')}
            </Text>
          </View>

          {/* 설명 *\/}
          <View className="w-full mb-8">
            <Text
              size="md"
              textColor="pale-purple"
              weight="light"
              className="text-left leading-6"
            >
              {t('features.mypage.profile_status.reject.description_1')}{"\n"}
              {t('features.mypage.profile_status.reject.description_2')}
            </Text>
          </View>

          {/* 거절 사유 카드 *\/}
          <View className="w-full mb-8">
            <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <Text size="12" textColor="white" weight="bold">
                    !
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    className="mb-1"
                  >
                    {t('features.mypage.profile_status.reject.reason_title')}
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    {rejectionReason}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 안내 텍스트 *\/}
          <Text
            size="sm"
            textColor="gray"
            weight="light"
            className="text-center mt-8"
          >
            {t('features.mypage.profile_status.reject.reapply_info')}
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼들 *\/}
      <View className="w-full px-6 pb-8 gap-1 space-y-3">
        <Button
          variant="primary"
          size="md"
          onPress={handleReapply}
          className="w-full py-4 rounded-2xl"
        >
          <View className="flex-row items-center justify-center">
            <Text
              size="md"
              textColor="white"
              weight="semibold"
              className="mr-2"
            >
              ↻
            </Text>
            <Text size="md" textColor="white" weight="semibold">
              {t('features.mypage.profile_status.reject.reapply_button')}
            </Text>
          </View>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onPress={handleContactSupport}
          className="w-full py-4 rounded-2xl bg-surface-background border border-gray-300"
        >
          <View className="flex-row items-center justify-center">
            <Text size="md" textColor="gray" weight="medium" className="mr-2">
              🎧
            </Text>
            <Text size="md" textColor="gray" weight="medium">
              {t('features.mypage.profile_status.reject.contact_support')}
            </Text>
          </View>
        </Button>
      </View>
    </DefaultLayout>
  );
}
*/

export default function DeprecatedProfileImgEditRejectScreen() {
  return null;
}
