import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { semanticColors } from '../../../shared/constants/colors';

import { useAuth } from "@/src/features/auth";
import {
  getProfileId,
  getUniversityVerificationStatus,
} from "@/src/features/university-verification/apis";
import { UniversityName, getUnivLogo } from "@/src/shared/libs/univ";
import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { useCurrentGem } from "@features/payment/hooks";
import { ImageResources } from "@shared/libs";
import { ImageResource } from "@ui/image-resource";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRematchingTickets } from "../queries";
import { useTranslation } from "react-i18next";

export const Profile = () => {
  const { profileDetails } = useAuth();
  const { data: reMatchingTicketCount } = useRematchingTickets();
  const [isUniversityVerified, setIsUniversityVerified] =
    useState<boolean>(false);
  const [isLoadingVerification, setIsLoadingVerification] =
    useState<boolean>(true);
  const { data: gem } = useCurrentGem();
  const profileData = {
    name: profileDetails?.name || "이름",
    age: profileDetails?.age || "20",
    grade: profileDetails?.universityDetails?.grade || "19학번",
    university: profileDetails?.universityDetails?.name || "한밭대학교",
    profileImage:
      profileDetails?.profileImages?.find((image) => image.isMain)?.url ||
      require("@/assets/images/profile.png"),
    totalRematchingTickets: reMatchingTicketCount?.total ?? 0,
  };
  const { t } = useTranslation();
  useEffect(() => {
    const checkUniversityVerification = async () => {
      try {
        const profileId = await getProfileId();
        const verificationStatus = await getUniversityVerificationStatus(
          profileId
        );

        if (verificationStatus.verifiedAt) {
          const verifiedYear = new Date(
            verificationStatus.verifiedAt
          ).getFullYear();
          const currentYear = new Date().getFullYear();
          setIsUniversityVerified(verifiedYear === currentYear);
        } else {
          setIsUniversityVerified(false);
        }
      } catch (error) {
        console.error("대학교 인증 상태 확인 실패:", error);
        setIsUniversityVerified(false);
      } finally {
        setIsLoadingVerification(false);
      }
    };

    checkUniversityVerification();
  }, []);

  const handleProfileEdit = () => {
    router.push("/profile-edit/profile");
  };

  const handleUniversityVerification = () => {
    if (!isUniversityVerified) {
      router.push("/university-verification");
    }
  };

  const getUniversityLogoUrl = () => {
    if (isUniversityVerified && profileData.university) {
      const univName = profileData.university as UniversityName;
      if (Object.values(UniversityName).includes(univName)) {
        return getUnivLogo(univName);
      }
    }
    return null;
  };

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={["#E9D9FF", "#D6B6FF"]}
        style={styles.baseRectangle}
      />
      <View style={styles.overlapWrapper}>
        <View style={styles.overlapRectangle}>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 130,
                height: 130,
                marginLeft: 10,

                borderRadius: 10,
                backgroundColor: semanticColors.surface.background,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                key={profileData.profileImage || ""}
                source={profileData.profileImage}
                style={{ borderRadius: 10, width: 120, height: 120 }}
              />
            </View>
            <View style={styles.profileInfoContainer}>
              <Text className="text-text-inverse " style={styles.name}>
                {profileData.name}
              </Text>
              <View style={styles.subInfo}>
                <Text className="text-text-inverse" style={styles.subInfoText}>
                  {profileData.grade}
                </Text>
                <Text className="text-text-inverse" style={styles.subInfoText}>
                  {" "}
                  ·{" "}
                </Text>
                <Text className="text-text-inverse" style={styles.subInfoText}>
                  {profileData.university}
                </Text>
                {!isLoadingVerification &&
                  (() => {
                    const logoUrl = getUniversityLogoUrl();
                    return isUniversityVerified && logoUrl ? (
                      <Image
                        source={{ uri: logoUrl }}
                        style={{ width: 14, height: 14, marginLeft: 3 }}
                      />
                    ) : (
                      <IconWrapper style={{ marginLeft: 3 }} size={14}>
                        <NotSecuredIcon />
                      </IconWrapper>
                    );
                  })()}
              </View>
              {/* 대학교 인증 버튼 - 로딩 완료 후 인증 미완료 시에만 표시 */}
              {!isLoadingVerification && !isUniversityVerified && (
                <TouchableOpacity
                  onPress={handleUniversityVerification}
                  style={styles.universityVerificationButton}
                >
                  <Image
                    source={require("@/assets/images/icon_change.png")}
                    style={{ width: 16, height: 16, marginRight: 4 }}
                  />
                  <Text style={styles.universityVerificationButtonText}>
                    {t("features.profile-edit.ui.header.university_verification")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                zIndex: 30,
                position: "absolute",
                top: -15,
                right: 15,
              }}
            >
              <Pressable onPress={handleProfileEdit}>
                <View style={styles.leftRect} />
                <View style={styles.leftRadius} />
                <View style={[styles.previousButton]}>
                  <View style={styles.updateContainer}>
                    <Image
                      source={require("@/assets/images/arrow-up.png")}
                      style={{ width: 20, height: 8 }}
                    />

                    <Text className="text-[10px] text-brand-secondary">
                      {t("features.profile-edit.ui.header.title")}
                    </Text>
                  </View>
                </View>
                <View style={styles.rightRect} />
                <View style={styles.rightRadius} />
              </Pressable>
            </View>
          </View>
        </View>
        <View
          className="pt-[5px] pl-[32px] flex-row"
          style={{ alignItems: "center" }}
        >
          <ImageResource resource={ImageResources.GEM} width={28} height={28} />
          <View className="pl-[10px] flex-row">
            <Text className="text-[13px] text-text-inverse">{t("features.profile-edit.ui.header.gem")} </Text>
            <Text className="text-[13px] text-brand-secondary">
              {" "}
              {t("features.profile-edit.ui.header.gem_unit",{count:gem?.totalGem ?? 0})}
            </Text>
            <Text className="text-[13px] text-text-inverse"> {t("features.profile-edit.ui.header.gem_left")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  baseRectangle: {
    width: 331,
    height: 200,
    borderRadius: 15,
    zIndex: 0,
  },
  overlapWrapper: {
    position: "relative",
    marginTop: -185,
    zIndex: 1,
  },
  overlapRectangle: {
    width: 361,
    height: 150,
    borderRadius: 15,
    backgroundColor: semanticColors.brand.secondary,
    paddingRight: 15,
    paddingTop: 10,
    overflow: "hidden",
  },
  previousButton: {
    width: 74,
    height: 42.75,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: '#E9D9FF',
  },
  leftRect: {
    width: 19,
    height: 20,
    backgroundColor: semanticColors.surface.other,
    position: "absolute",
    top: 5,
    left: -18,
  },
  leftRadius: {
    width: 20,
    height: 20,
    backgroundColor: semanticColors.brand.secondary,
    borderTopRightRadius: 14,
    position: "absolute",
    top: 5,
    left: -18,
  },
  rightRadius: {
    width: 20,
    height: 20,
    backgroundColor: semanticColors.brand.secondary,
    borderTopLeftRadius: 14,
    position: "absolute",
    top: 5,
    right: -18,
  },
  rightRect: {
    width: 19,
    height: 20,
    backgroundColor: semanticColors.surface.other,
    position: "absolute",
    top: 5,
    right: -18,
  },
  updateContainer: {
    paddingTop: 8,
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontSize: 26,
    fontFamily: "regular",
    fontWeight: 400,
    lineHeight: 30,
    color: semanticColors.text.inverse,
  },
  profileInfoContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  subInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  subInfoText: {
    fontSize: 14,
    color: semanticColors.text.inverse,
    lineHeight: 15.6,
  },
  universityVerificationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  universityVerificationButtonText: {
    fontSize: 12,
    color: semanticColors.brand.secondary,
    fontFamily: "semibold",
    fontWeight: 600,
  },
});

export default Profile;
