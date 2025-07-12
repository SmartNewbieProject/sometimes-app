import { useAuth } from "@/src/features/auth";
import { usePreferenceSelfQuery } from "@/src/features/home/queries";
import Interest from "@/src/features/interest";
import { PreferenceKeys } from "@/src/features/interest/queries";
import Layout from "@/src/features/layout";
import MyInfo from "@/src/features/my-info";

import { useMbti } from "@/src/features/mypage/hooks";
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

function Profile() {
  const { updateForm, clear: _, ...form } = useInterestForm();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { profileDetails } = useAuth();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { showErrorModal } = useModal();

  const disabled = !!(
    !form.age ||
    !form.goodMbti ||
    !form.badMbti ||
    !form.personality ||
    form.personality.length === 0
  );

  console.log("profileDat", profileDetails);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if (profileDetails?.id) {
  //     updateForm(
  //       "drinking",
  //       preferenceSelf?.find(
  //         (item) => item.typeName === PreferenceKeys.DRINKING
  //       )?.selectedOptions[0]
  //     );
  //     updateForm("mbti", profileDetails.mbti);
  //     updateForm(
  //       "interestIds",
  //       preferenceSelf
  //         ?.find((item) => item.typeName === PreferenceKeys.INTEREST)
  //         ?.selectedOptions?.map((item) => item.id) as string[]
  //     );
  //     updateForm(
  //       "datingStyleIds",
  //       preferenceSelf
  //         ?.find((item) => item.typeName === PreferenceKeys.DATING_STYLE)
  //         ?.selectedOptions?.map((item) => item.id) as string[]
  //     );
  //     if (profileDetails.gender === "MALE") {
  //       updateForm(
  //         "militaryStatus",
  //         preferenceSelf?.find(
  //           (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
  //         )?.selectedOptions[0]
  //       );
  //     }
  //     updateForm(
  //       "personality",
  //       preferenceSelf?.find(
  //         (item) => item.typeName === PreferenceKeys.PERSONALITY
  //       )?.selectedOptions[0].id
  //     );
  //     updateForm(
  //       "smoking",
  //       preferenceSelf?.find((item) => item.typeName === PreferenceKeys.SMOKING)
  //         ?.selectedOptions[0]
  //     );
  //     updateForm(
  //       "tattoo",
  //       preferenceSelf?.find((item) => item.typeName === PreferenceKeys.TATTOO)
  //         ?.selectedOptions[0]
  //     );
  //   }
  // }, [ JSON.stringify(profileDetails), updateForm]);

  // const onFinish = async () => {
  //   setFormSubmitLoading(true);
  //   await tryCatch(
  //     async () => {
  //       const validation = Object.values(form).every((v) => v !== null);
  //       if (!validation) throw new Error("비어있는 양식이 존재합니다.");
  //       console.log("submitform", form);
  //       await savePreferences({
  //         datingStyleIds: form.datingStyleIds,
  //         interestIds: form.interestIds,
  //         drinking: form.drinking?.id as string,
  //         smoking: form.smoking?.id as string,
  //         tattoo: form.tattoo?.id as string,
  //         personality: form.personality as string,
  //         militaryStatus: form.militaryStatus?.id as string,

  //         mbti: form.mbti as string,
  //       });
  //       updateMbti(form.mbti as string);
  //       await queryClient.invalidateQueries({
  //         queryKey: ["preference-self"],
  //       });
  //       router.navigate("/my");
  //       setFormSubmitLoading(false);
  //     },
  //     ({ error }) => {
  //       showErrorModal(error, "error");
  //       setFormSubmitLoading(false);
  //     }
  //   );
  // };

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
        onPress={() => {}}
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

export default Profile;
