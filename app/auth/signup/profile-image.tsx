import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import { semanticColors } from '@/src/shared/constants/semantic-colors';

import { type SignupForm, SignupSteps } from "@/src/features/signup/hooks";

import {
  GuideView,
  guideHeight,
  useOverlay,
} from "@/src/shared/hooks/use-overlay";
import { useSignupSession } from "@/src/shared/hooks/use-signup-session";

import { Button } from "@/src/shared/ui";
import { Text } from "@/src/shared/ui/text";

import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";


import useProfileImage from "@/src/features/signup/hooks/use-profile-image";
import { withSignupValidation } from "@/src/features/signup/ui/withSignupValidation";
import { useStorage } from "@/src/shared/hooks/use-storage";
import Animated from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import useSignupProgress from "@/src/features/signup/hooks/use-signup-progress";
import { OppositeGenderPreview, ProfileImageGrid } from "@/src/widgets";

const { height } = Dimensions.get("window");

function ProfilePage() {
  const {
    getImaages,
    visible,
    nextable,
    uploadImage,
    onNext,
    onBackPress,
  } = useProfileImage();
  const { t } = useTranslation();
  const { form, updateShowHeader } = useSignupProgress();

  useEffect(() => {
    updateShowHeader(true);
  }, [updateShowHeader]);

  // 업로드된 이미지 개수 계산 (실시간 업데이트)
  const uploadedCount = [0, 1, 2].filter((i) => {
    const image = getImaages(i);
    return image !== null && image !== undefined;
  }).length;


  return (
    <DefaultLayout className="flex-1 relative">
      <GuideView paddingBottom={150}>
        <View className="px-5 ">
          <Image
            source={require("@assets/images/profile-image.png")}
            style={{ width: 81, height: 81 }}
          />
          <Text weight="semibold" size="20" textColor="black" className="mt-2">
            {t("apps.auth.sign_up.profile_image.main_title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.auth.sign_up.profile_image.main_title_2")} 
          </Text>
        </View>

        <View className="flex flex-col pb-[18px] pt-4 px-5">
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t("apps.auth.sign_up.profile_image.guide_1")}
          </Text>
          <Text weight="medium" size="sm" textColor="pale-purple">
            {t("apps.auth.sign_up.profile_image.guide_2")}
          </Text>
          <Text weight="medium" size="sm" textColor="purple" style={{ marginTop: 8 }}>
            {t("apps.auth.sign_up.profile_image.guide_3")}
          </Text>
        </View>

        <ProfileImageGrid
          images={[getImaages(0), getImaages(1), getImaages(2)]}
          onImageChange={uploadImage}
        />

        {/* 반대 성별 프로필 프리뷰 */}
        <OppositeGenderPreview uploadedCount={uploadedCount} userGender={form.gender} />
      </GuideView>

      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <TwoButtons
          disabledNext={!nextable}
          onClickNext={onNext}
          content={{ next: t("global.next") }}
          onClickPrevious={onBackPress}
        />
      </View>
    </DefaultLayout>
  );
}

export default withSignupValidation(ProfilePage, SignupSteps.PROFILE_IMAGE);

const styles = StyleSheet.create({
  infoOverlayWrapper: {
    bottom: 200,
    position: "absolute",

    right: 90,
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  infoWrapper: {
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    marginBottom: 223,

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
  infoTitle: {
    color: semanticColors.brand.accent,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: "#BAB0D0",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: semanticColors.surface.background,
  },
});
