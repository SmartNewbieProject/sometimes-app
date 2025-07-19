import { useAuth } from "@/src/features/auth";
import { usePreferenceSelfQuery } from "@/src/features/home/queries";
import Layout from "@/src/features/layout";
import MyInfo from "@/src/features/my-info";
import { PreferenceKeys } from "@/src/features/my-info/queries";
import { savePreferences } from "@/src/features/my-info/services";
import { useMbti } from "@/src/features/mypage/hooks";
import ProfileDatingStyle from "@/src/features/profile-edit/ui/profile/profile-dating-style";
import ProfileDrinking from "@/src/features/profile-edit/ui/profile/profile-drinking";
import ProfileImageSection from "@/src/features/profile-edit/ui/profile/profile-image-section";
import ProfileInterest from "@/src/features/profile-edit/ui/profile/profile-interest";
import ProfileMbti from "@/src/features/profile-edit/ui/profile/profile-mbti";
import ProfileMilitary from "@/src/features/profile-edit/ui/profile/profile-military";
import ProfilePersonality from "@/src/features/profile-edit/ui/profile/profile-personality";
import ProfileSmoking from "@/src/features/profile-edit/ui/profile/profile-smoking";
import ProfileTattoo from "@/src/features/profile-edit/ui/profile/profile-tattoo";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { Button } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { hooks } = MyInfo;
const { useMyInfoForm } = hooks;

function Profile() {
  const { updateForm, clear: _, ...form } = useMyInfoForm();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, updateMbti, isUpdating } = useMbti();

  const { profileDetails } = useAuth();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { showErrorModal } = useModal();
  const { data: preferenceSelf = [] } = usePreferenceSelfQuery();

  const disabled = !!(
    !form ||
    !form.datingStyleIds ||
    !form.personality ||
    !form.interestIds ||
    !form.mbti ||
    form.datingStyleIds?.length === 0 ||
    form.personality.length === 0 ||
    form.interestIds.length === 0
  );
  console.log("check point", profileDetails, preferenceSelf);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (profileDetails?.id && preferenceSelf) {
      updateForm(
        "drinking",
        preferenceSelf?.find(
          (item) => item.typeName === PreferenceKeys.DRINKING
        )?.selectedOptions[0]
      );
      updateForm("mbti", profileDetails.mbti);
      updateForm(
        "interestIds",
        preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.INTEREST)
          ?.selectedOptions?.map((item) => item.id) as string[]
      );
      updateForm(
        "datingStyleIds",
        preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.DATING_STYLE)
          ?.selectedOptions?.map((item) => item.id) as string[]
      );
      if (profileDetails.gender === "MALE") {
        updateForm(
          "militaryStatus",
          preferenceSelf?.find(
            (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
          )?.selectedOptions[0]
        );
      }
      updateForm(
        "personality",
        preferenceSelf?.find(
          (item) => item.typeName === PreferenceKeys.PERSONALITY
        )?.selectedOptions[0].id
      );
      updateForm(
        "smoking",
        preferenceSelf?.find((item) => item.typeName === PreferenceKeys.SMOKING)
          ?.selectedOptions[0]
      );
      updateForm(
        "tattoo",
        preferenceSelf?.find((item) => item.typeName === PreferenceKeys.TATTOO)
          ?.selectedOptions[0]
      );
    }
  }, [preferenceSelf?.length, JSON.stringify(profileDetails), updateForm]);

  const onFinish = async () => {
    setFormSubmitLoading(true);
    await tryCatch(
      async () => {
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        console.log("submitform", form);
        await savePreferences({
          datingStyleIds: form.datingStyleIds,
          interestIds: form.interestIds,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string,
          militaryStatus: form.militaryStatus?.id as string,

          mbti: form.mbti as string,
        });
        updateMbti(form.mbti as string);
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
        <ProfileImageSection />
        <ProfileMbti />
        <ProfileInterest />
        <ProfilePersonality />
        <ProfileDatingStyle />
        {profileDetails?.gender === "MALE" && <ProfileMilitary />}
        <ProfileDrinking />
        <ProfileSmoking />
        <ProfileTattoo />
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

export default Profile;
