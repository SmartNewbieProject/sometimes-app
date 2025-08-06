import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import HeartIcon from "@assets/icons/area-fill-heart.svg";
import { Image } from "expo-image";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  queries,
  apis,
  useSignupAnalytics,
} = Signup;

export default function SignupInstagram() {
  const { updateForm, form } = useSignupProgress();
  const [instagramId, setInstagramId] = useState("");
  const insets = useSafeAreaInsets();

  useChangePhase(SignupSteps.INSTAGRAM);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { trackSignupEvent } = useSignupAnalytics("university_details");

  const onNext = async () => {
    if (instagramId === "") {
      return;
    }
    updateForm({ instagramId: `@${instagramId}` });
    trackSignupEvent("next_button_click", "to_profile_image");

    router.push("/auth/signup/profile-image");
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <>
      <DefaultLayout>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,

            position: "relative",
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
              <Text style={styles.title}>인스타그램 아이디를 알려주세요</Text>
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

          {!keyboardVisible && (
            <View style={styles.infoWrapper}>
              <Text style={styles.infoTitle}>
                프로필을 매력적으로 보여주세요!
              </Text>
              <Text style={styles.infoDescription}>
                사진을 업로드하고 계정을 공개로 설정하면
              </Text>
              <Text style={styles.infoDescription}>
                매칭 확률이 더 높아져요
              </Text>
              <Image
                source={require("@assets/images/instagram-some.png")}
                style={{
                  width: 116,
                  height: 175,
                  position: "absolute",
                  top: 20,
                  right: -66,
                }}
              />
              <Image
                source={require("@assets/images/instagram-lock.png")}
                style={{
                  width: 52,
                  height: 52,
                  position: "absolute",
                  top: -30,
                  left: -30,
                  transform: [{ rotate: "-10deg" }],
                }}
              />
            </View>
          )}
        </View>

        <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
          <View style={styles.tipConatainer}>
            <HeartIcon width={20} height={20} />
            <Text style={styles.tip}>
              인스타그램은 매칭된 상대에게만 공개됩니다
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

const styles = StyleSheet.create({
  title: {
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    lineHeight: 22,
    color: "#7A4AE2",
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
    outline: "none",
    color: "#000",
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 22,
    textAlignVertical: "center",
    paddingVertical: 0,
    fontSize: 15,
    marginLeft: 1,
  },
  instagramText: {
    color: "#000",
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 22,

    fontSize: 15,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
  tipConatainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
  tip: {
    color: "#9B94AB",
    fontWeight: 300,
    fontFamily: "Pretendard-Thin",
    fontSize: 13,

    lineHeight: 20,
  },
  infoWrapper: {
    bottom: 223,
    position: "absolute",
    marginLeft: 30,
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  infoTitle: {
    color: "#9F84D8",
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: "#BAB0D0",
  },
});
