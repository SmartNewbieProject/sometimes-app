import SmallTitle from "@/assets/icons/small-title.svg";
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
import { useTranslation } from "react-i18next";
const { useSignupProgress, useSignupAnalytics } = Signup;

export default function SignupDoneScreen() {
  const { clear } = useSignupProgress();
  const { t } = useTranslation();
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
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        className="text-primaryPurple md:pb-[58px] py-12"
      >
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <Image
          source={require("@assets/images/signup-done.png")}
          style={{ width: 298, height: 296, marginTop: 50 }}
        />

        <View className="flex flex-col">
          <View className="mt-[42px]">
            <Text size="lg" textColor="black" weight="semibold">
              {t("apps.auth.sign_up.done.congrats")}
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              {t("apps.auth.sign_up.done.signup_complete")}
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              {t("apps.auth.sign_up.done.start_love")}
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              {t("apps.auth.sign_up.done.find_match")}
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[24px] md:mb-[58px]">
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          className="w-full items-center "
        >
          {loading ? (
            <>
              <Text textColor={"white"} className="text-md white">
                {t("apps.auth.sign_up.done.loading")}
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                className="ml-6"
              />
            </>
          ) : (
            <Text textColor={"white"} className="text-md white">
              <Text textColor={"white"} className="text-md white">
              {t("apps.auth.sign_up.done.go_login")}
            </Text>
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}
