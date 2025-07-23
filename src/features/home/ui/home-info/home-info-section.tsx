import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Home from "../..";
import HomeInfoCard from "./home-info-card";
const { ui, queries, hooks } = Home;

const { usePreferenceSelfQuery } = queries;

const { useRedirectPreferences } = hooks;

function HomeInfoSection() {
  const { isPreferenceFill } = useRedirectPreferences();
  const { data: preferencesSelf } = usePreferenceSelfQuery();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <HomeInfoCard
        buttonMessage={preferencesSelf?.length !== 0 ? "완료" : "입력 하기"}
        buttonDisabled={preferencesSelf?.length !== 0}
        onClick={() => router.navigate("/my-info")}
        imageUri={require("@assets/images/my-info.png")}
        title={"나의 정보"}
        description="성격, 취미, 연애 스타일 등"
      />
      <HomeInfoCard
        buttonMessage={isPreferenceFill ? "완료" : "입력 하기"}
        buttonDisabled={isPreferenceFill}
        onClick={() => router.navigate("/interest")}
        imageUri={require("@assets/images/interest-info.png")}
        title={"이상형 정보"}
        description="선호하는 성격, 취향, 음주 등"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 1,
    width: "100%",
    overflow: "hidden",
    marginTop: 14,
  },
});

export default HomeInfoSection;
