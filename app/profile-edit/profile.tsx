import { useAuth } from "@/src/features/auth";
import { usePreferenceSelfQuery } from "@/src/features/home/queries";
import Layout from "@/src/features/layout";
import PageLoading from "@/src/features/loading/ui/page";
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
import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { hooks } = MyInfo;
const { useMyInfoForm } = hooks;

function ProfileContent() {
  const { t } = useTranslation();
  const { updateForm, ...form } = useMyInfoForm();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, updateMbti, isUpdating } = useMbti();

  const { profileDetails } = useAuth();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { showErrorModal } = useModal();
  const { data: preferenceSelf = [] } = usePreferenceSelfQuery();
  const setInitialSnapshot = useMyInfoForm((state) => state.setInitialSnapshot);
  const hasChanges = useMyInfoForm((state) => state.hasChanges);

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["my-profile-details"] });
  }, []);

  const validation = !!(
    !form ||
    !form.datingStyleIds ||
    !form.personality ||
    !form.interestIds ||
    !form.mbti ||
    form.datingStyleIds?.length === 0 ||
    form.personality.length === 0 ||
    form.interestIds.length === 0
  );

  const disabled = !hasChanges() || validation;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (profileDetails?.id && preferenceSelf && !form.init) {
      const drinking = preferenceSelf?.find(
        (item) => item.typeName === PreferenceKeys.DRINKING
      )?.selectedOptions[0];

      const militaryStatus = preferenceSelf?.find(
        (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
      )?.selectedOptions[0];
      const smoking = preferenceSelf?.find(
        (item) => item.typeName === PreferenceKeys.SMOKING
      )?.selectedOptions[0];
      const tattoo = preferenceSelf?.find(
        (item) => item.typeName === PreferenceKeys.TATTOO
      )?.selectedOptions[0];
      if (drinking) {
        updateForm("drinking", drinking);
      }
      if (militaryStatus && profileDetails.gender === "MALE") {
        updateForm("militaryStatus", militaryStatus);
      }
      if (smoking) {
        updateForm("smoking", smoking);
      }
      if (tattoo) {
        updateForm("tattoo", tattoo);
      }
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

      updateForm(
        "personality",
        preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.PERSONALITY)
          ?.selectedOptions?.map((item) => item.id) as string[]
      );

      updateForm("init", true);

      // 초기 스냅샷 저장 (프로필 이미지 제외)
      setInitialSnapshot({
        drinking,
        mbti: profileDetails.mbti,
        init: true,
        interestIds: preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.INTEREST)
          ?.selectedOptions?.map((item) => item.id) as string[],
        datingStyleIds: preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.DATING_STYLE)
          ?.selectedOptions?.map((item) => item.id) as string[],
        militaryStatus,
        personality: preferenceSelf
          ?.find((item) => item.typeName === PreferenceKeys.PERSONALITY)
          ?.selectedOptions?.map((item) => item.id) as string[],
        smoking,
        tattoo,
      });
    }
  }, [preferenceSelf, profileDetails?.id, profileDetails?.mbti, profileDetails?.gender, form.init, setInitialSnapshot]);

  const onFinish = async () => {
    setFormSubmitLoading(true);
    await tryCatch(
      async () => {
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error(t("apps.profile-edit.ui.validation.empty_form"));
        console.log("submitform", form);
        await savePreferences({
          datingStyleIds: form.datingStyleIds,
          interestIds: form.interestIds,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string[],
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
      >
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
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 31,
          paddingBottom: insets.bottom + 15,
          paddingTop: 15,
        }}
      >
        <Button
          disabled={disabled}
          onPress={onFinish}
          rounded="lg"
          styles={{ width: "100%" }}
        >
          {t("apps.profile_edit.ui.save_button")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});

function Profile() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

export default Profile;
