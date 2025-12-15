import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Signup from "@/src/features/signup";
import { withSignupValidation } from "@/src/features/signup/ui/withSignupValidation";
import HeartIcon from "@assets/icons/area-fill-heart.svg";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  useSignupAnalytics,
} = Signup;
function SignupInstagram() {
  const { updateForm } = useSignupProgress();
  const [instagramId, setInstagramId] = useState("");
  const { t } = useTranslation();

  useChangePhase(SignupSteps.INSTAGRAM);
  const { trackSignupEvent } = useSignupAnalytics("university_details");

  const onNext = async () => {
    if (instagramId === "") {
      return;
    }
    updateForm({ instagramId: `${instagramId}` });
    trackSignupEvent("next_button_click", "to_profile_image");

    router.push("/auth/signup/profile-image");
  };

  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/auth/signup/university-details");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);


  return (
    <>
      <DefaultLayout>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
        >
          <View>
            <View className="px-[5px]">
              <Image
                source={require("@assets/images/instagram.png")}
                style={{ width: 81, height: 81 }}
                className="mb-4"
              />
            </View>

            <View style={[styles.contentWrapper, { zIndex: 10 }]}>
              <Text style={styles.title}>{t("apps.auth.sign_up.instagram.title")}</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.instagramText}>@</Text>
                <TextInput
                  value={instagramId}
                  onChangeText={(text) => setInstagramId(text)}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

        </View>

        <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
          <View style={styles.tipConatainer}>
            <HeartIcon width={20} height={20} />
            <Text style={styles.tip}>
              {t("apps.auth.sign_up.instagram.tip")}
            </Text>
          </View>
          <TwoButtons
            disabledNext={instagramId === ""}
            onClickNext={onNext}
            onClickPrevious={() => {
              router.navigate("/auth/signup/university-details");
            }}
          />
        </View>
      </DefaultLayout>
    </>
  );
}

export default withSignupValidation(SignupInstagram, SignupSteps.INSTAGRAM);

const styles = StyleSheet.create({
  title: {
    fontWeight: 600,
    fontFamily: "semibold",
    fontSize: 18,
    lineHeight: 22,
    color: semanticColors.brand.primary,
  },
  contentWrapper: {
    gap: 15,
    marginTop: 34,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    width: 306,
    borderBottomColor: "#E2D9FF",
    borderBottomWidth: 1,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,

    color: semanticColors.text.primary,
    fontFamily: "thin",
    fontWeight: 300,
    lineHeight: 22,
    textAlignVertical: "center",
    paddingVertical: 0,
    fontSize: 15,
    marginLeft: 1,
  },
  instagramText: {
    color: semanticColors.text.primary,
    fontFamily: "thin",
    fontWeight: 300,
    lineHeight: 22,

    fontSize: 15,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: semanticColors.surface.background,
  },
  tipConatainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
  tip: {
    color: semanticColors.text.disabled,
    fontWeight: 300,
    fontFamily: "thin",
    fontSize: 13,
    lineHeight: 20,
  },
});
