import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, Button } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { IconWrapper } from '@/src/shared/ui/icons';
import SmallTitle from '@assets/icons/small-title.svg';
import Signup from '@/src/features/signup';

export default function CommingSoonScreen() {
  const { form } = Signup.useSignupProgress();
  
  return (
    <View className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper width={128} className="text-primaryPurple md:pb-[58px] py-8">
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1 items-center">
        <Image
          source={require('@assets/images/commingsooncharacter.png')}
          style={{ width: 200, height: 200 }}
        />

        <View className="flex flex-col">
          <View className="mt-8 px-5" >
            <Text size="md" textColor="black" weight="semibold">
              {form.name}님!
            </Text>
            <Text size="md" textColor="black" weight="semibold">
              빨리 보고싶어요!
            </Text>
          </View>

          <View className="mt-2 px-5">
            <Text weight="medium" size="sm" textColor="black">
              곧, 당신에게 꼭 맞는 사람을 소개해드릴게요.
            </Text>
            <Text weight="medium" size="sm" textColor="black">
              <Text weight="medium" size="sm" textColor="dark">
                4월 27일
              </Text>
              {', '}꼭 다시 만나요!
            </Text>
          </View>
          <View className="mt-24 items-center">
            <Text size="sm" textColor="pale-purple" weight="light">
              회원님의 이메일로 관련 내용을 발신했습니다.
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5">
        <Button
          variant="primary"
          size="md"
          onPress={() => {}}
          className="mb-[14px] w-full"
        >
          출시일에 다시 볼게요.
        </Button>
      </View>
    </View>
  );
}
