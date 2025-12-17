import { View, Text, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

const celebrationImage = require("@assets/images/info-miho.png");

export default function SignupDoneScreen() {
  const handleGoToService = () => {
    router.replace("/onboarding?source=signup");
  };

  return (
    <DefaultLayout style={styles.layout}>
      <View style={styles.content}>
        <Image source={celebrationImage} style={styles.image} resizeMode="contain" />

        <Text style={styles.title}>가입 완료!</Text>
        <Text style={styles.subtitle}>
          썸타임에 오신 것을 환영해요{"\n"}
          지금 바로 설레는 만남을 시작해보세요
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TwoButtons
          disabledNext={false}
          onClickNext={handleGoToService}
          content={{ next: "서비스 보러가기" }}
          hidePrevious
        />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: "Pretendard-Bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
    color: colors.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: semanticColors.surface.background,
  },
});
