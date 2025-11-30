import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import { environmentStrategy } from "@/src/shared/libs";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { track } from "@amplitude/analytics-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
const { useSignupProgress, useSignupAnalytics } = Signup;

export default function SignupDoneScreen() {
  const { clear } = useSignupProgress();
  const [loading, setLoading] = useState(true);
  const { trackSignupEvent } = useSignupAnalytics("done");
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);
  const onNext = () => {
    trackSignupEvent("completion_button_click");
    track("Signup_done", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    clear();
    router.push("/auth/login");
  };

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        style={styles.iconWrapper}
      >
        <SmallTitle />
      </IconWrapper>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <View
            style={styles.circleBackground}
          />
          <Image
            source={require("@assets/images/signup-done.png")}
            style={styles.signupImage}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text size="lg" textColor="black" weight="semibold">
              축하드려요!
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              회원가입이 완료되었어요!
            </Text>
          </View>

          <View style={styles.subtitleContainer}>
            <Text size="sm" textColor="pale-purple" weight="light">
              설레는 인연, 시작해볼까요?
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              어울리는 사람을 썸타임이 찾아드릴게요 :)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          style={styles.button}
        >
          {loading ? (
            <>
              <Text textColor={"white"} style={styles.buttonText}>
                잠시만요...
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                style={styles.activityIndicator}
              />
            </>
          ) : (
            <Text textColor={"white"} style={styles.buttonText}>
              로그인하러 가기 →
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    color: semanticColors.primaryPurple,
    paddingBottom: 48,
    paddingTop: 48,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
  },
  circleBackground: {
    width: 274,
    height: 274,
    borderRadius: 274,
    top: 12,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: 'absolute',
  },
  signupImage: {
    width: 298,
    height: 296,
    marginTop: 50,
  },
  textContainer: {
    flexDirection: 'column',
  },
  titleContainer: {
    marginTop: 42,
  },
  subtitleContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  activityIndicator: {
    marginLeft: 24,
  },
});
