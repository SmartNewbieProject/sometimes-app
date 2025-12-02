import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '../../src/shared/constants/colors';
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View , Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApprovalRejectedScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || t("apps.auth.approval-rejected.card_reason_default");
  const phoneNumber = params.phoneNumber as string;
  const { logoutOnly } = useAuth();

  const handleReapply = () => {
    router.push({
      pathname: "/auth/reapply",
      params: { phoneNumber, rejectionReason },
    });
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
          {/* SOMETIME 로고 */}
          <View className="mt-[10px] mb-[28px]">
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 */}
          <View className="items-center mb-8 relative">
            <View
              style={{
                width: 165,
                height: 165,
                borderRadius: 81,
                top: -8,
                left: 0,

                backgroundColor: semanticColors.brand.primary,
                position: "absolute",
              }}
            />
            <Image
              source={require("@assets/images/limit-signup.png")}
              style={{ width: 160, height: 160 }}
              className="mb-6"
            />
          </View>

          {/* 제목 */}
          <View className="w-full mb-4">
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              className="text-left"
            >
              {t("apps.auth.approval-rejected.title")}
            </Text>
          </View>

          {/* 설명 */}
          <View className="w-full mb-8">
            <Text
              size="md"
              textColor="gray"
              weight="light"
              className="text-left leading-6"
            >
              {t("apps.auth.approval-rejected.desc")}
            </Text>
          </View>

          {/* 거절 사유 카드 */}
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
                    {t("apps.auth.approval-rejected.card_title")}
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    {rejectionReason}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 안내 텍스트 */}
          <Text
            size="sm"
            textColor="gray"
            weight="light"
            className="text-center mt-8"
          >
            {t("apps.auth.approval-rejected.guide")}
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View className="w-full px-6 pb-8 gap-3 space-y-3">
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
              {t("apps.auth.approval-rejected.button_reapply")}
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
              {t("apps.auth.approval-rejected.button_support")}
            </Text>
          </View>
        </Button>
      </View>
    </DefaultLayout>
  );
}
