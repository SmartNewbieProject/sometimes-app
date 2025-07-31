import SmallTitle from "@/assets/icons/small-title.svg";
import Signup from "@/src/features/signup";
import { environmentStrategy } from "@/src/shared/libs";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View } from "react-native";
const { useSignupProgress, useSignupAnalytics } = Signup;

export default function SignupDoneScreen() {
  const { clear } = useSignupProgress();

  const { trackSignupEvent } = useSignupAnalytics("done");

  const onNext = () => {
    trackSignupEvent("completion_button_click");
    clear();
    router.push("/auth/login");
  };

  return (
    <View className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper width={128} className="text-primaryPurple md:pb-[58px] py-8">
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <Image
          source={require("@assets/images/signup-done.png")}
          style={{ width: 290, height: 380 }}
        />

        <View className="flex flex-col">
          <View className="mt-4">
            <Text size="lg" textColor="black" weight="semibold">
              축하드려요!
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              회원가입이 완료되었어요!
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              회원가입이 완료되었어요!
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              이제 당신의 이상형을 만나보세요
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[14px] md:mb-[58px]">
        <Button variant="primary" size="md" onPress={onNext} className="w-full">
          이상형 찾으러 가기 →
        </Button>
      </View>
    </View>
  );
}
