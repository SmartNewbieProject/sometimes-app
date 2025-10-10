import SmallTitle from "@/assets/icons/small-title.svg";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ProfileImgEditDoneScreen() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);
  const onNext = () => {
    router.push("/home");
  };

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
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
              축하드려요!
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              사진 변경이 완료되었어요!
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              사진 변경이 완료되었어요!
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              이제 새로운 프로필로 당신의 이상형을 만나보세요.
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[24px] md:mb-[58px]">
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          className="w-full items-center "
        >
          {loading ? (
            <>
              <Text textColor={"white"} className="text-md white">
                잠시만요...
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                className="ml-6"
              />
            </>
          ) : (
            <Text textColor={"white"} className="text-md white">
              이상형 찾으러 가기 →
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}
