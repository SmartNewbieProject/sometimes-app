import { track } from "@amplitude/analytics-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FloatingTooltip, Show } from "@/src/shared/ui";
import Home from "../..";
import HomeInfoCard from "./home-info-card";
const { ui, queries, hooks } = Home;

const { usePreferenceSelfQuery } = queries;

const { useRedirectPreferences } = hooks;

function HomeInfoSection() {
  const { isPreferenceFill } = useRedirectPreferences();
  const { data: preferencesSelf } = usePreferenceSelfQuery();
  const router = useRouter();
  const handleClickButton = (to: "my-info" | "interest") => {
    if (to === "my-info") {
      track("Profile_Started", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
      router.navigate("/my-info");
    } else {
      track("Interest_Started", {
        type: "home",
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
      router.navigate("/interest");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <HomeInfoCard
          buttonMessage={preferencesSelf?.length !== 0 ? "완료" : "입력 하기"}
          buttonDisabled={preferencesSelf?.length !== 0}
          onClick={() => handleClickButton("my-info")}
          imageUri={require("@assets/images/my-info.png")}
          title={"나의 정보"}
          description="성격, 취미, 연애 스타일 등"
        />
        <Show when={preferencesSelf?.length === 0}>
        <FloatingTooltip 
          text="이상형 매칭을 위해 나의 정보를 입력하세요!" 
          rotation="bottom" 
        />
        </Show>

      </View>
      <View style={styles.cardContainer}>
        <HomeInfoCard
          buttonMessage={isPreferenceFill ? "완료" : "입력 하기"}
          buttonDisabled={isPreferenceFill}
          onClick={() => handleClickButton("interest")}
          imageUri={require("@assets/images/interest-info.png")}
          title={"이상형 정보"}
          description="선호하는 성격, 취향, 음주 등"
        />
        <Show when={!isPreferenceFill}>
        <FloatingTooltip 
          text="이상형 매칭을 위해 이상형 정보를 입력하세요!" 
          rotation="bottom" 
        />
        </Show>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 1,
    width: "100%",
    overflow: "visible",
    marginTop: 14,
    marginBottom: 50,
  },
  cardContainer: {
    position: "relative",
    flex: 1,
  },
});

export default HomeInfoSection;
