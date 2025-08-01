import { useAuth } from "@/src/features/auth";
import Layout from "@/src/features/layout";
import { useModal } from "@/src/shared/hooks/use-modal";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { track } from "@amplitude/analytics-react-native";
import SmallTitle from "@assets/icons/small-title.svg";
import { router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

export default function InterestIntroScreen() {
  const { showModal } = useModal();
  const { profileDetails } = useAuth();
  const showPreviousModal = () =>
    showModal({
      customTitle: (
        <Text
          textColor="purple"
          weight="semibold"
          style={{ paddingBottom: 8, fontSize: 18 }}
        >
          나중에 등록할까요?
        </Text>
      ),
      children: (
        <View>
          <Text size="md" textColor="black" weight="light">
            원활한 이상형 매칭을 위해
          </Text>
          <Text size="md" textColor="black" weight="light">
            {profileDetails?.name} 님의 이상형 정보를 등록해주세요!
          </Text>
        </View>
      ),
      primaryButton: {
        text: "등록할게요!",
        onClick: () => router.push("/interest/age"),
      },
      secondaryButton: {
        text: "다음에 할게요",
        onClick: () => router.navigate("/"),
      },
    });

  const onNext = () => {
    track("Interest_Intro");
    router.push("/interest/age");
  };

  return (
    <Layout.Default>
      <View style={styles.contentContainer}>
        <PalePurpleGradient />
        <View style={styles.titleLogoWrapper}>
          <IconWrapper width={128} style={styles.titleLogoIcon}>
            <SmallTitle />
          </IconWrapper>
        </View>
        <View style={styles.textWrapper}>
          <Image
            source={require("@assets/images/interest.png")}
            style={{ width: 248, height: 323 }}
          />

          <View style={styles.titleWrapper}>
            <Text size="lg" textColor="black" weight="semibold">
              매칭을 위해
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              이상형 정보를 꼭 알려주세요!
            </Text>
          </View>

          <View style={styles.descriptionWrapper}>
            <Text size="sm" textColor="pale-purple" weight="light">
              이상형 정보를 정확하게 입력할수록
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              매칭 성공 확률이 높아져요
            </Text>
          </View>
        </View>

        <Layout.TwoButtons
          onClickNext={onNext}
          disabledNext={false}
          onClickPrevious={showPreviousModal}
          content={{
            prev: "뒤로",
            next: "다음으로",
          }}
        />
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleLogoWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleLogoIcon: {
    paddingBottom: 52.85,
    paddingTop: 21,
  },
  titleWrapper: {
    marginTop: 20,
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  descriptionWrapper: {
    marginTop: 50.53,
  },
});
