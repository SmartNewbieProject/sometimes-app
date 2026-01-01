import Interest from "@/src/features/interest";
import type { Preferences } from "@/src/features/interest/api";
import colors from "@/src/shared/constants/colors";
import { PreferenceSlider } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function InterestMilitary() {
  const { updateForm, militaryPreference } = useInterestForm();
  const { t } = useTranslation();

  const {
    data: preferencesArray = [{ typeCode: "", typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeCode === PreferenceKeys.MILITARY_PREFERENCE
    ) ?? preferencesArray[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.interest.military.title")}</Text>
      <PreferenceSlider
        preferences={preferences}
        value={militaryPreference}
        onChange={(option) => updateForm("militaryPreference", option)}
        isLoading={optionsLoading}
        loadingTitle={t("features.profile-edit.ui.interest.military.loading")}
        middleLabelLeft={-15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
});

export default InterestMilitary;
