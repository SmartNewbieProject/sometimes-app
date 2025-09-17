import { Header, Text, PalePurpleGradient } from "@/src/shared/ui";
import { router } from "expo-router";
import { View, Pressable, Image, TouchableOpacity } from "react-native";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useTranslation } from "react-i18next";

export default function UniversityVerificationSuccess() {
  const { t } = useTranslation();
  const handleGoToProfile = () => {
    router.push("/home");
  };

  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="normal" textColor="black">
            {t("apps.university-verification.header_title")}
          </Text>
        </Header.CenterContent>
        <Header.RightContent></Header.RightContent>
      </Header.Container>

      <View className="flex-1 px-5 justify-center items-center relative">
        {/* 메인 이미지 */}
        <View className="mb-16 mt-8">
          <Image
            source={require("@/assets/images/verification_done.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
          />
        </View>

        {/* 메인 텍스트 */}
        <View className="mb-20 w-[80%] items-start">
          <Text size="lg" weight="normal" textColor="black" className="mb-1">
            {t("apps.university-verification.success.congratulations")}
          </Text>
          <Text size="lg" weight="normal" textColor="black" className="mb-2">
            {t("apps.university-verification.success.verification_complete")}
          </Text>

          <Text size="sm" weight="normal" className="mb-1 text-[#9B94AB]">
            {t("apps.university-verification.success.verification_complete")}
          </Text>
          <Text size="sm" weight="normal" className="text-[#9B94AB]">
            {t("apps.university-verification.success.find_ideal_type")}
          </Text>
        </View>

        {/* 하단 버튼 */}
        <View className="absolute bottom-8 left-5 right-5">
          <TouchableOpacity
            onPress={handleGoToProfile}
            className="bg-[#8B5CF6] rounded-2xl py-4 items-center"
          >
            <Text size="md" weight="semibold" textColor="white">
              {t("apps.university-verification.success.go_to_find_ideal_type")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
