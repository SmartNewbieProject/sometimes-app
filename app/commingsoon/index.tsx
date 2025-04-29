import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, Button } from '@/src/shared/ui';
import { Image } from 'expo-image';
import { IconWrapper } from '@/src/shared/ui/icons';
import SmallTitle from '@assets/icons/small-title.svg';
import Signup from '@/src/features/signup';
import { useAuth } from '@/src/features/auth';
import { useModal } from '@/src/shared/hooks/use-modal';

export default function CommingSoonScreen() {
  const { form: signupForm } = Signup.useSignupProgress();
  const { profileDetails } = useAuth();
  const { showModal } = useModal();

  const onClickSeeYouLater = () =>
    showModal({
      title: '꼭 다시 만나요!',
      children: <Text>5월 6일, 꼭 다시 만나요!</Text>,
      primaryButton: {
        text: '확인',
        onClick: () => { },
      },
    });

  // 회원가입 데이터를 우선 확인하고, 없으면 로그인 프로필 데이터 사용
  const userName = signupForm.name || profileDetails?.name;

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
              {userName}님!
            </Text>
            <Text size="md" textColor="black" weight="semibold">
              빨리 보고싶어요!
            </Text>
          </View>

          <View className="mt-2 px-5">
            <Text weight="medium" size="sm" style={{ color: '#49386E' }}>
              곧, 당신에게 꼭 맞는 사람을 소개해드릴게요.
            </Text>
            <Text weight="medium" size="sm" style={{ color: '#49386E' }}>
              <Text weight="medium" size="sm" textColor="dark">
                5월 6일
              </Text>
              {', '}꼭 다시 만나요!
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5">
        <Text size="sm" textColor="pale-purple" weight="light" className="text-center mb-4">
          회원님의 이메일로 관련 내용을 발신했습니다.
        </Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => {
            onClickSeeYouLater();

          }}
          className="mb-[14px] w-full"
        >
          출시일에 다시 볼게요.
        </Button>
      </View>
    </View>
  );
}
