import { IconWrapper } from "@/src/shared/ui/icons";
import { View } from "react-native";
import SmallTitle from '@/assets/icons/small-title.svg';
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from 'expo-image';
import { router } from "expo-router";
import { environmentStrategy } from "@/src/shared/libs";
import Signup from '@/src/features/signup';
const { useSignupProgress } = Signup;

export default function SignupDoneScreen() {
  const { clear, form } = useSignupProgress();

  const onNext = () => {
    const email = form.email;
    clear();

    environmentStrategy({
      production: () => {
        if (email === 'billing-test@gmail.com') {
          return router.push('/auth/login');
        }

        router.push('/commingsoon');
      },
      development: () => {
        router.push('/auth/login');
      },
    });
  };

  return (
    <View className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper width={128} className="text-primaryPurple md:pb-[58px] py-8">
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <Image
          source={require('@assets/images/signup-completion.png')}
          style={{ width: 248, height: 290 }}
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

    <View className="w-full px-5">
    <Button
        variant="primary"
        size="md"
        onPress={onNext}
        className="mb-[14px] w-full"
      >
        이상형 찾으러 가기 →
      </Button>
    </View>
    </View>
  );
}