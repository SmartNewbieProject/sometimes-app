import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Button } from "@/src/shared/ui/button";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router } from "expo-router";
import type React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DefaultLayout } from "../../layout/ui";
import i18n from '@/src/shared/libs/i18n';
interface AgeRestrictionScreenProps {
  onGoBack?: () => void;
}

/**
 * 가입 불가능한 연령 사용자에게 표시되는 나이 제한 안내 화면 (만 18세 미만 또는 28세 이상)
 */
export const AgeRestrictionScreen: React.FC<AgeRestrictionScreenProps> = ({
  onGoBack,
}) => {
  const insets = useSafeAreaInsets();
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.replace("/auth/login");
    }
  };

  const ageMessage = {
    title: i18n.t('features.pass.ageRestriction.title'),
    subtitle: i18n.t('features.pass.ageRestriction.subtitle'),
    bottomText: i18n.t('features.pass.ageRestriction.bottomText'),
  };

  return (
    <DefaultLayout className="flex-1" style={{ backgroundColor: semanticColors.surface.background }}>
      <PalePurpleGradient />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          width: "100%",
          paddingTop: insets.top,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 */}
        <View className="mt-[20px] mb-[38px]">
          <SmallTitleIcon width={160} height={40} />
        </View>

        <View className="flex-1 px-5 min-h-screen w-full items-center">
          {/* 상단 이미지 */}
          <View className="items-center  relative ">
            <View style={{ position: "absolute", top: -30, left: 0 }}>
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
              source={require("@assets/images/limit-age.png")}
              style={{ width: 259, height: 259 }}
              className="mb-6"
            />
          </View>

          {/* 메인 텍스트 */}
          <View className="mb-8">
            <Text
              weight="semibold"
              size="20"
              textColor="black"
              className="text-center mb-2"
            >
              {ageMessage.title}
            </Text>
            <Text
              size="md"
              textColor="pale-purple"
              className="text-center leading-6 px-4"
            >
              {ageMessage.subtitle}
            </Text>
          </View>

          {/* 안내 정보 */}
          <View className="bg-surface-background rounded-2xl p-6 mb-8 w-full  shadow-sm mx-2">
            <View className="flex-row items-center mb-4">
              <View className="w-6 h-6 bg-lightPurple rounded-full items-center justify-center mr-3">
                <Text size="sm" textColor="purple" weight="semibold">
                  ℹ
                </Text>
              </View>
              <Text weight="semibold" size="md" textColor="black">
                {i18n.t('features.pass.ageRestriction.usageConditions.title')}
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">
                  •
                </Text>
                <Text size="sm" textColor="black" className="flex-1">
                  {i18n.t('features.pass.ageRestriction.usageConditions.ageRange')}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">
                  •
                </Text>
                <Text size="sm" textColor="black" className="flex-1">
                  {i18n.t('features.pass.ageRestriction.usageConditions.education')}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text size="sm" textColor="pale-purple" className="mr-2 mt-0.5">
                  •
                </Text>
                <Text size="sm" textColor="black" className="flex-1">
                  {i18n.t('features.pass.ageRestriction.usageConditions.verification')}
                </Text>
              </View>
            </View>
          </View>

          {/* 하단 텍스트 */}
          <View className="mb-8">
            <Text
              weight="semibold"
              size="18"
              textColor="black"
              className="text-center mb-2"
            >
              {ageMessage.bottomText}
            </Text>
            <Text
              size="sm"
              textColor="pale-purple"
              className="text-center px-4"
            >
              {i18n.t('features.pass.ageRestriction.birthDateCheck')}
            </Text>
          </View>

          {/* 버튼 */}
          <View className="mt-auto px-2 pb-4">
            <Button
              variant="primary"
              size="md"
              onPress={handleGoBack}
              className="w-full"
            >
              {i18n.t('features.pass.ageRestriction.findIdealTypeButton')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </DefaultLayout>
  );
};
