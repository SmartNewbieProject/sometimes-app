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
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { hooks } = Interest;
const { useInterestForm } = hooks;

function InterestSection() {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (profileDetails?.preferences) {
      const preferences = profileDetails.preferences;
      const additionalPreferences = profileDetails.additionalPreferences;
      updateForm(
        "drinking",
        preferences?.find((item) => item.typeName === PreferenceKeys.DRINKING)
          ?.selectedOptions[0]
      );
      updateForm(
        "age",
        preferences?.find((item) => item.typeName === PreferenceKeys.AGE)
          ?.selectedOptions[0].id
      );
      updateForm("goodMbti", additionalPreferences?.goodMbti);
      updateForm("badMbti", additionalPreferences?.badMbti);

      if (profileDetails.gender === "MALE") {
        updateForm(
          "militaryPreference",
          preferences?.find(
            (item) => item.typeName === PreferenceKeys.MILITARY_PREFERENCE
          )?.selectedOptions[0]
        );
      }
      updateForm(
        "personality",
        preferences?.find(
          (item) => item.typeName === PreferenceKeys.PERSONALITY
        )?.selectedOptions[0].id
      );
      updateForm(
        "smoking",
        preferences?.find((item) => item.typeName === PreferenceKeys.SMOKING)
          ?.selectedOptions[0]
      );
      updateForm(
        "tattoo",
        preferences?.find((item) => item.typeName === PreferenceKeys.TATTOO)
          ?.selectedOptions[0]
      );
    }
  }, [JSON.stringify(profileDetails), updateForm]);

  const onFinish = async () => {
    setFormSubmitLoading(true);
    await tryCatch(
      async () => {
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          personality: form.personality as string,
          tattoo: form.tattoo?.id as string,
          militaryPreference: form.militaryPreference?.id ?? "",
          goodMbti: form.goodMbti as string,
          badMbti: form.badMbti as string,
        });
        await queryClient.invalidateQueries({
          queryKey: ["check-preference-fill"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["preference-self"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["my-profile-details"],
        });
        router.navigate("/my");
        setFormSubmitLoading(false);
      },
      ({ error }) => {
        showErrorModal(error, "error");
        setFormSubmitLoading(false);
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
        저장
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
