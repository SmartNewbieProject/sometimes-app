import Layout from "@/src/features/layout";
import { View, Image } from "react-native";
import SmallTitle from '@assets/icons/small-title.svg';
import { IconWrapper } from "@/src/shared/ui/icons";
import { PalePurpleGradient, Text, ProgressBar } from "@/src/shared/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
import { router } from "expo-router";
import { useAuth } from "@/src/features/auth";

export default function InterestIntroScreen() {
  const { showModal } = useModal();
  const { profileDetails } = useAuth();

  const showPreviousModal = () =>
    showModal({
      customTitle:
        <Text textColor="purple" weight="semibold" className="text-[18px] pb-2">
          나중에 등록할까요?
        </Text>,
      children:
        <View>
          <Text size="md" textColor="black" weight="light">
            원활한 이상형 매칭을 위해
          </Text>
          <Text size="md" textColor="black" weight="light">
            {profileDetails?.name} 님의 이상형 정보를 등록해주세요!
          </Text>
        </View>,
      primaryButton: {
        text: "등록할게요!",
        onClick: () => router.navigate('/interest/age'),
      },
      secondaryButton: {
        text: "다음에 할게요",
        onClick: () => router.navigate('/'),
      },
    });

  return (
    <Layout.Default
      className="flex flex-1 flex-col w-full"
    >
      <PalePurpleGradient />
      <View className="w-full justify-center items-center">
        <IconWrapper width={128} className="pt-8 pb-4">
          <SmallTitle />
        </IconWrapper>
      </View>
      <View className="flex-1 flex flex-col items-center w-full">
        <Image
          source={require('@assets/images/interest.png')}
          style={{ width: 248, height: 323 }}
        />

        <View>
          <Text size="lg" textColor="black" weight="semibold">
            매칭을 위해
          </Text>
          <Text size="lg" textColor="black" weight="semibold">
            이상형 정보를 꼭 알려주세요!
          </Text>
        </View>

        <View className="self-start px-[38px] pt-1.5">
          <Text size="sm" textColor="pale-purple" weight="light">
            이상형 정보를 정확하게 입력할수록
          </Text>
          <Text size="sm" textColor="pale-purple" weight="light">
            매칭 성공 확률이 높아져요
          </Text>
        </View>
      </View>

      <Layout.TwoButtons
        onClickNext={() => router.navigate('/interest/age')}
        onClickPrevious={showPreviousModal}
        content={{
          prev: '이전',
          next: '다음으로'
        }}
      />
    </Layout.Default>
  );
}
