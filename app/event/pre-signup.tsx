import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Signup from '@features/signup';
import Event from '@features/event';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';
import { useEffect } from 'react';
import { TotalMatchCounter } from '@/src/features/home/ui';
import { Button, PalePurpleGradient, Text } from '@shared/ui';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { useSignupProgress } = Signup;
const { hooks: { useEventAnalytics } } = Event;

export default function PreSignupScreen() {
  const { clear } = useSignupProgress();

  // 애널리틱스 추적 설정
  const { trackEventAction } = useEventAnalytics('pre-signup');

  useEffect(() => {
    clear();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, height: "100%" }}
    >
      <PalePurpleGradient />
      <ScrollView className="flex-1">
        <View className={cn(
          "flex flex-col items-center gap-y-2 px-6 flex-1",
          platform({
            ios: () => "pt-[80px]",
            android: () => "pt-[80px]",
            web: () => "pt-[40px]",
          })
        )}>

          <IconWrapper width={128} className="text-primaryPurple mb-6">
            <SmallTitle />
          </IconWrapper>

          <View className="w-full mb-6">
            <TotalMatchCounter count={1928} className="h-[64px] !min-h-[76px]" />
          </View>

          {/* 상단 제목 */}
          <View className="w-full flex flex-col items-center mb-6 mt-2">
            <View className="mb-2 max-w-[360px]">
              <View className="bg-white rounded-lg px-3 py-3 drop-shadow-md rounded-md">
                <Text
                  weight="bold"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A3EA1] to-[#9D6FFF] text-[18px] md:text-[22px] text-center whitespace-nowrap"
                >
                  우리가 너의 진짜 설렘을 찾아줄게
                </Text>
              </View>
            </View>
            <Text className="text-[#6A3EA1] text-[16px] md:text-[18px] text-center font-medium mt-2">
              ✨ 친구가 소개하는 것처럼 진심을 다해 ✨
            </Text>
          </View>

          {/* 첫 번째 카드 */}
          <View className="w-full bg-white rounded-xl drop-shadow-md p-5 pb-6 mb-4 mt-3">
            <View className="flex flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#6A3EA1] flex items-center justify-center mr-3">
                <Ionicons name="home" size={20} color="white" />
              </View>
              <Text className="text-[#333] text-[18px] font-bold">
                집순이, 집돌이를 위한
              </Text>
            </View>
            <Text className="text-[#666] text-[14px] leading-6">
              <Text className="font-bold">매번 집-학교-집</Text>이어서 주변에서{'\n'}
              이성을 만나기 어려운{'\n'}
              집순이, 집돌이를 위한
            </Text>
          </View>

          {/* 두 번째 카드 */}
          <View className="w-full bg-white rounded-xl drop-shadow-md p-5 pb-6 mb-4 flex-1">
            <View className="flex flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#6A3EA1] flex items-center justify-center mr-3">
                <FontAwesome5 name="user-friends" size={16} color="white" />
              </View>
              <Text className="text-[#333] text-[18px] font-bold">
                대전 대학생을 위한 1:1 소개팅
              </Text>
            </View>
            <Text className="text-[#666] text-[14px] leading-6">
              <Text className="font-bold">과팅, 미팅은 부담스럽고,</Text>{'\n'}
              소개 받을 곳이 없거나{'\n'}
              이미 다 소개받은 친구들을 위한 소개팅 플랫폼
            </Text>
          </View>

          {/* 세 번째 카드 */}
          <View className="w-full bg-white rounded-xl drop-shadow-md p-5 pb-6 mb-4">
            <View className="flex flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#6A3EA1] flex items-center justify-center mr-3">
                <MaterialIcons name="favorite" size={20} color="white" />
              </View>
              <Text className="text-[#333] text-[18px] font-bold">
                믿고 맡길 수 있는
              </Text>
            </View>
            <Text className="text-[#666] text-[14px] leading-6">
              <Text className="font-bold">한밭대 2,738명</Text>이 참여한 소개팅,{'\n'}
              이제는 대전 내 11개 대학에서,{'\n'}
              당신의 이상형을 찾아드립니다!
            </Text>
          </View>
        </View>

        <View className="w-full px-6 mb-6 md:mb-16 mt-4" style={{ opacity: 1 }}>
          <View
            className="flex flex-col gap-y-2 mb-5 md:mb-6 items-center"
            style={{ opacity: 1 }} // 강제로 opacity 설정
          >

          </View>
          <Button
            className="text-white w-full py-3 rounded-lg"
            onPress={() => {
              trackEventAction('signup_button_click');
              router.navigate('/auth/signup/terms');
            }}
          >
            소개팅 신청하기
          </Button>
          <Button
            variant="secondary"
            onPress={() => {
              trackEventAction('login_button_click');
              router.navigate('/auth/login');
            }}
            className="w-full mt-3 py-3 rounded-lg"
          >
            로그인하러 가기
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
