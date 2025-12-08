import { useAuth } from "@/src/features/auth";
import { usePreferenceSelfQuery } from "@/src/features/home/queries";
import Interest from "@/src/features/interest";
import { PreferenceKeys } from "@/src/features/interest/queries";
import { savePreferences } from "@/src/features/interest/services";
import InterestAge from "@/src/features/profile-edit/ui/interest/interest-age";
import InterestBadMbti from "@/src/features/profile-edit/ui/interest/interest-bad-mbti";
import InterestDrinking from "@/src/features/profile-edit/ui/interest/interest-drinking";
import InterestGoodMbti from "@/src/features/profile-edit/ui/interest/interest-good-mbti";
import InterestMilitary from "@/src/features/profile-edit/ui/interest/interest-military";
import InterestPersonality from "@/src/features/profile-edit/ui/interest/interest-personality";
import InterestSmoking from "@/src/features/profile-edit/ui/interest/interest-smoking";
import InterestTattoo from "@/src/features/profile-edit/ui/interest/interest-tattoo";

import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { Button } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { showErrorModal } = useModal();

  const disabled = !!(
    !form.age ||
    !form.personality ||
    form.personality.length === 0
  );
  useEffect(() => {
    if (!profileDetails?.preferences || !Array.isArray(profileDetails.preferences)) {
      return;
    }

    try {
      const preferences = profileDetails.preferences;
      const additionalPreferences = profileDetails.additionalPreferences;

      const drinkingPreference = preferences.find(
        (item) => item?.typeName === PreferenceKeys.DRINKING
      );
      const drinking = drinkingPreference?.selectedOptions?.[0];

      const militaryPreferenceData = preferences.find(
        (item) => item?.typeName === PreferenceKeys.MILITARY_PREFERENCE
      );
      const militaryPreference = militaryPreferenceData?.selectedOptions?.[0];

      const smokingPreference = preferences.find(
        (item) => item?.typeName === PreferenceKeys.SMOKING
      );
      const smoking = smokingPreference?.selectedOptions?.[0];

      const tattooPreference = preferences.find(
        (item) => item?.typeName === PreferenceKeys.TATTOO
      );
      const tattoo = tattooPreference?.selectedOptions?.[0];

      const agePreference = preferences.find(
        (item) => item?.typeName === PreferenceKeys.AGE
      );
      const age = agePreference?.selectedOptions?.[0];

      const personalityPreference = preferences.find(
        (item) => item?.typeName === PreferenceKeys.PERSONALITY
      );
      const personality = personalityPreference?.selectedOptions;

      if (drinking?.id) {
        updateForm("drinking", drinking);
      }
      if (militaryPreference?.id && profileDetails.gender === "FEMALE") {
        updateForm("militaryPreference", militaryPreference);
      }
      if (smoking?.id) {
        updateForm("smoking", smoking);
      }
      if (tattoo?.id) {
        updateForm("tattoo", tattoo);
      }
      if (age?.id) {
        updateForm("age", age.id);
      }
      if (Array.isArray(personality) && personality.length > 0) {
        const personalityIds = personality
          .filter((item) => item?.id)
          .map((item) => item.id);
        if (personalityIds.length > 0) {
          updateForm("personality", personalityIds);
        }
      }

      if (additionalPreferences?.goodMbti !== undefined) {
        updateForm("goodMbti", additionalPreferences.goodMbti);
      }
      if (additionalPreferences?.badMbti !== undefined) {
        updateForm("badMbti", additionalPreferences.badMbti);
      }
    } catch (error) {
      console.error("Failed to initialize interest form:", error);
    }
  }, [profileDetails?.id, updateForm]);

  const onFinish = async () => {
    setFormSubmitLoading(true);
    await tryCatch(
      async () => {
        if (!form.age || typeof form.age !== "string") {
          throw new Error(t("apps.profile-edit.ui.validation.age_required"));
        }

        if (!form.drinking?.id) {
          throw new Error(t("apps.profile-edit.ui.validation.drinking_required"));
        }

        if (!form.smoking?.id) {
          throw new Error(t("apps.profile-edit.ui.validation.smoking_required"));
        }

        if (!Array.isArray(form.personality) || form.personality.length === 0) {
          throw new Error(t("apps.profile-edit.ui.validation.personality_required"));
        }

        if (!form.tattoo?.id) {
          throw new Error(t("apps.profile-edit.ui.validation.tattoo_required"));
        }

        await savePreferences({
          age: form.age,
          drinking: form.drinking.id,
          smoking: form.smoking.id,
          personality: form.personality,
          tattoo: form.tattoo.id,
          militaryPreference: form.militaryPreference?.id ?? "",
          goodMbti: form.goodMbti ?? null,
          badMbti: form.badMbti ?? null,
        });

        await queryClient.invalidateQueries({ queryKey: ["check-preference-fill"] });
        await queryClient.invalidateQueries({ queryKey: ["preference-self"] });
        await queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });

        router.navigate("/my");
        setFormSubmitLoading(false);
      },
      ({ error }) => {
        console.error("Failed to save interest preferences:", error);
        showErrorModal(error, "error");
        setFormSubmitLoading(false);
      }
    );
  };

  if (!profileDetails) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
      <ScrollView>
        <InterestAge />
        <InterestGoodMbti />
        <InterestBadMbti />
        <InterestPersonality />
        {profileDetails.gender === "FEMALE" && <InterestMilitary />}
        <InterestDrinking />
        <InterestSmoking />
        <InterestTattoo />
      </ScrollView>
      <Button
        disabled={disabled || formSubmitLoading}
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
