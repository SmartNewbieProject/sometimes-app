import { useAuth } from "@/src/features/auth";
import { usePreferenceSelfQuery } from "@/src/features/home/queries";
import Interest from "@/src/features/interest";
import { useSavePartnerPreferencesMutation } from "@/src/features/interest/hooks";
import { PreferenceKeys } from "@/src/features/interest/queries";
import InterestAge from "@/src/features/profile-edit/ui/interest/interest-age";
import InterestBadMbti from "@/src/features/profile-edit/ui/interest/interest-bad-mbti";
import InterestDrinking from "@/src/features/profile-edit/ui/interest/interest-drinking";
import InterestGoodMbti from "@/src/features/profile-edit/ui/interest/interest-good-mbti";
import InterestMilitary from "@/src/features/profile-edit/ui/interest/interest-military";
import InterestPersonality from "@/src/features/profile-edit/ui/interest/interest-personality";
import InterestSmoking from "@/src/features/profile-edit/ui/interest/interest-smoking";
import InterestTattoo from "@/src/features/profile-edit/ui/interest/interest-tattoo";

import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { Button } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { hooks } = Interest;
const { useInterestForm } = hooks;

function InterestSection() {
  const { t } = useTranslation();
  const { updateForm, clear: _, ...form } = useInterestForm();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { profileDetails } = useAuth();
  const { showErrorModal } = useModal();
  const { mutateAsync: savePreferences, isPending: formSubmitLoading } = useSavePartnerPreferencesMutation();

  const disabled = !!(
    !form.age ||
    !form.personality ||
    form.personality.length === 0
  );
  useEffect(() => {
    if (profileDetails?.preferences) {
      const preferences = profileDetails.preferences;
      const additionalPreferences = profileDetails.additionalPreferences;

      const drinking = preferences?.find(
        (item) => item.typeName === PreferenceKeys.DRINKING
      )?.selectedOptions[0];
      const militaryPreference = preferences?.find(
        (item) => item.typeName === PreferenceKeys.MILITARY_PREFERENCE
      )?.selectedOptions[0];
      const smoking = preferences?.find(
        (item) => item.typeName === PreferenceKeys.SMOKING
      )?.selectedOptions[0];
      const tattoo = preferences?.find(
        (item) => item.typeName === PreferenceKeys.TATTOO
      )?.selectedOptions[0];
      const age = preferences?.find(
        (item) => item.typeName === PreferenceKeys.AGE
      )?.selectedOptions[0];
      const personality = preferences?.find(
        (item) => item.typeName === PreferenceKeys.PERSONALITY
      )?.selectedOptions;

      if (drinking) {
        updateForm("drinking", drinking);
      }
      if (militaryPreference && profileDetails.gender === "FEMALE") {
        updateForm("militaryPreference", militaryPreference);
      }
      if (smoking) {
        updateForm("smoking", smoking);
      }
      if (tattoo) {
        updateForm("tattoo", tattoo);
      }
      if (age?.id) {
        updateForm("age", age.id);
      }
      if (personality && personality.length > 0) {
        updateForm("personality", personality.map((item) => item.id));
      }

      updateForm("goodMbti", additionalPreferences?.goodMbti);
      updateForm("badMbti", additionalPreferences?.badMbti);
    }
  }, [profileDetails?.id, updateForm]);

  const onFinish = async () => {
    await tryCatch(
      async () => {
        const validation = Object.entries(form)
          .filter(([key]) => key !== "goodMbti" && key !== "badMbti")
          .every(([_, value]) => value !== null);
        if (!validation)
          throw new Error(
            t("apps.profile-edit.ui.validation.empty_form")
          );
        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          personality: form.personality as string[],
          tattoo: form.tattoo?.id as string,
          militaryPreference: form.militaryPreference?.id ?? "",
          goodMbti: form.goodMbti ?? null,
          badMbti: form.badMbti ?? null,
        });

        router.navigate("/my");
      },
      ({ error }) => {
        console.log("error", error);
        showErrorModal(error, "error");
      }
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
      <ScrollView>
        <InterestAge />
        <InterestGoodMbti />
        <InterestBadMbti />
        <InterestPersonality />
        {profileDetails?.gender === "FEMALE" && <InterestMilitary />}
        <InterestDrinking />
        <InterestSmoking />
        <InterestTattoo />
      </ScrollView>
      <Button
        disabled={disabled}
        onPress={onFinish}
        rounded="lg"
        styles={{
          bottom: insets.bottom + 15,
          position: "absolute",
          left: 28,
          right: 28,
        }}
      >
        {t("apps.profile_edit.ui.save_button")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
});

export default InterestSection;
