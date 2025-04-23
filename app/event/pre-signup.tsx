import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';
import { useEffect } from 'react';
import { Image } from "expo-image";
import { ReviewSlide, TotalMatchCounter } from '@/src/features/home/ui';
import { Button, ImageResource, Text } from '@shared/ui';
import { ImageResources } from '@/src/shared/libs';
import { router } from 'expo-router';

const { useSignupProgress } = Signup;

export default function PreSignupScreen() {
  const { clear } = useSignupProgress();

  useEffect(() => {
    clear();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, height: "100%" }}
    >
      <PalePurpleGradient />
      <View className={cn(
        "flex flex-col items-center gap-y-2 px-4 flex-1",
        platform({
          ios: () => "pt-[80px]",
          android: () => "pt-[80px]",
          web: () => "pt-[30px]",
        })
      )}>

        <IconWrapper width={128} className="text-primaryPurple md:pb-[28px]">
          <SmallTitle />
        </IconWrapper>
        <View className="p-0 md:p-4 mt-[8px] hidden md:block">
          <Image
            source={require('@assets/images/paper-plane.png')}
            style={{ width: 128, height: 128 }}
          />
        </View>
        <View className="w-full mt-4">
          <TotalMatchCounter count={786} className="h-[64px] !min-h-[76px]" />
        </View>

        <View className="flex flex-col gap-y-[8px] w-full mt-4 items-center">
          <View className="w-full h-[52px] bg-[#F3EDFF] rounded-xl flex justify-center items-center mx-4">
            <Text className="text-[#49386E] text-[13px] md:text-[16px]" weight="semibold" size="13">
              베타 테스트에서 한밭대생 2,700명 참여한 소개팅
            </Text>
          </View>
          <View className="w-full h-[52px] bg-[#F3EDFF] rounded-xl flex justify-center items-center mx-4">
            <Text className="text-[#49386E] text-[13px] md:text-[16px]" weight="semibold" size="13">
              대전광역시 대학생만을 위한 소개팅 플랫폼
            </Text>
          </View>
          <View className="w-full h-[52px] bg-[#F3EDFF] rounded-xl flex justify-center items-center mx-4">
            <Text className="text-[#49386E] text-[13px] md:text-[16px]" weight="semibold">
              AI를 활용한 나만의 이상형 분석 및 매칭
            </Text>
          </View>

          <View className="mb-4 hidden md:block w-full mt-4">
            <ReviewSlide />
          </View>
        </View>

      </View>



      <View className="w-full px-4 mb-4 md:mb-16">
        <View className="flex flex-col gap-y-1 mb-1.5 md:mb-4 items-center">
          <Text textColor="pale-purple" weight="semibold" size="13">
            미리 회원가입을 진행하시면
          </Text>
          <Text textColor="pale-purple" weight="semibold" size="13">
            연인 즉시 매칭 티켓 을 발급해드려요!
          </Text>
        </View>
        <Button className="text-white w-full" onPress={() => router.navigate('/auth/signup/terms')}>
          사전회원가입하러 가기
        </Button>
        <Button variant="secondary" onPress={() => router.navigate('/auth/login')} className="w-full mt-1.5">
          로그인하러 가기
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
