import { IconWrapper } from "@/src/shared/ui/icons";
import { View } from "react-native";
import SmallTitle from '@/assets/icons/small-title.svg';
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from 'expo-image';
import { router, useFocusEffect } from "expo-router";
import Signup from "@features/signup";
import { useCallback, useEffect } from "react";

const { useSignupProgress } = Signup;

export default function InterestDoneScreen() {
  const { clear } = useSignupProgress();

  // development 환경에서만 회원가입 데이터 초기화
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      clear();
    }
  }, []);

  return (
    <View className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper width={128} className="text-primaryPurple md:pb-[58px] py-8">
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <Image
          source={require('@assets/images/interest-done.png')}
          style={{ width: 248, height: 290, aspectRatio: 1 }}
        />

        <View className="flex flex-col">
          <View className="mt-4">
            <Text size="lg" textColor="black" weight="semibold">
              이상형 정보를 확인했어요
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              이제 이상형을 찾아드릴게요
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              썸타임이 000님의 이상형을 찾아드릴게요
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5">
        <Button
          variant="primary"
          size="md"
          onPress={() => {
            const redirectPath = process.env.NODE_ENV === 'production' ? '/commingsoon' : '/home';
            router.push(redirectPath);
          }}
          className="mb-[14px] w-full"
        >
          이상형 찾으러 가기 →
        </Button>
      </View>
    </View>
  );
}