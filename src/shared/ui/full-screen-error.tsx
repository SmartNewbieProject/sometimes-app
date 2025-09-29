import SmallTitle from "@/assets/icons/small-title.svg";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { ActivityIndicator, View } from "react-native";

interface FullScreenErrorProps {
  onClose: () => void;
}

export default function FullScreenError({ onClose }: FullScreenErrorProps) {
  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center  md:w-[468px] self-center">
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        className="text-primaryPurple md:pb-[58px] py-12"
      >
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 274,
              height: 274,
              borderRadius: 274,
              top: 12,
              left: 0,

              backgroundColor: "#7A4AE2",
              position: "absolute",
            }}
          />
          <Image
            source={require("@assets/images/signup-done.png")}
            style={{ width: 298, height: 296, marginTop: 50 }}
          />
        </View>

        <View className="flex flex-col">
          <View className="mt-[42px]">
            <Text size="lg" textColor="black" weight="semibold">
              에러가 발생했어요!
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              미호가 열심히 원인을 찾고 있어요
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              이용에 불편을 드려서 죄송합니다
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[24px] md:mb-[58px]">
        <Button
          variant="primary"
          size="md"
          onPress={onClose}
          className="w-full items-center "
        >
          <Text textColor={"white"} className="text-md white">
            돌아가기 →
          </Text>
        </Button>
      </View>
    </DefaultLayout>
  );
}
