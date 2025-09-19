import { track } from "@amplitude/analytics-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          buttonMessage={
            preferencesSelf?.length !== 0
              ? t("features.home.ui.home_info.home_info_section.status_complete")
              : t("features.home.ui.home_info.home_info_section.status_incomplete")
          }
          buttonDisabled={preferencesSelf?.length !== 0}
          onClick={() => handleClickButton("my-info")}
          imageUri={require("@assets/images/my-info.png")}
          title={t("features.home.ui.home_info.home_info_section.my_info_title")}
          description={t(
            "features.home.ui.home_info.home_info_section.my_info_description"
          )}
        />
        <Show when={preferencesSelf?.length === 0}>
          <FloatingTooltip
            text={t(
              "features.home.ui.home_info.home_info_section.my_info_tooltip"
            )}
            rotation="bottom"
          />
        </Show>
      </View>
      <View style={styles.cardContainer}>
        <HomeInfoCard
          buttonMessage={
            isPreferenceFill
              ? t("features.home.ui.home_info.home_info_section.status_complete")
              : t("features.home.ui.home_info.home_info_section.status_incomplete")
          }
          buttonDisabled={isPreferenceFill}
          onClick={() => handleClickButton("interest")}
          imageUri={require("@assets/images/interest-info.png")}
          title={t(
            "features.home.ui.home_info.home_info_section.preference_info_title"
          )}
          description={t(
            "features.home.ui.home_info.home_info_section.preference_info_description"
          )}
        />
        <Show when={!isPreferenceFill}>
          <FloatingTooltip
            text={t(
              "features.home.ui.home_info.home_info_section.preference_info_tooltip"
            )}
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