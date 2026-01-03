import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';

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
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const { data: reMatchingTicketCount } = useRematchingTickets();
  const [isUniversityVerified, setIsUniversityVerified] =
    useState<boolean>(false);
  const [isLoadingVerification, setIsLoadingVerification] =
    useState<boolean>(true);
  const { data: gem } = useCurrentGem();
  const formatStudentNumber = (studentNumber: string | null | undefined): string => {
    if (!studentNumber) return "";
    const prefix = studentNumber.substring(0, 2);
    return t('features.mypage.profile.student_number', { prefix });
  };

  const profileData = {
    name: profileDetails?.name || "",
    age: profileDetails?.age || 0,
    grade: formatStudentNumber(profileDetails?.universityDetails?.studentNumber),
    university: profileDetails?.universityDetails?.name || "",
    profileImage:
      profileDetails?.profileImages?.find((image) => image.isMain)?.imageUrl ||
      profileDetails?.profileImages?.find((image) => image.isMain)?.url ||
      require("@/assets/images/profile.png"),
    totalRematchingTickets: reMatchingTicketCount?.total ?? 0,
  };
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
      >
        <View style={styles.gemContainer}>
          <ImageResource resource={ImageResources.GEM} width={24} height={24} />
          <View style={styles.gemTextRow}>
            <Text style={styles.gemText}>{t("features.profile-edit.ui.header.gem")} </Text>
            <Text style={styles.gemCountText}>
              {t("features.profile-edit.ui.header.gem_unit", { count: gem?.totalGem ?? 0 })}
            </Text>
            <Text style={styles.gemText}> {t("features.profile-edit.ui.header.gem_left")}</Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.overlapWrapper}>
        <View style={styles.overlapRectangle}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={({ pressed }) => [
                {
                  width: 130,
                  height: 130,
                  marginLeft: 10,
                  borderRadius: 10,
                  backgroundColor: semanticColors.surface.background,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => router.push('/profile/photo-management')}
            >
              <Image
                key={profileData.profileImage || ""}
                source={profileData.profileImage}
                style={{ borderRadius: 10, width: 120, height: 120 }}
              />
            </Pressable>
            <View style={styles.profileInfoContainer}>
              <Text textColor="white" style={styles.name}>
                {profileData.name}
              </Text>
              <View style={styles.subInfo}>
                <Text textColor="white" style={styles.subInfoText} numberOfLines={1}>
                  {profileData.grade} · {profileData.university}
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

                      <Text style={styles.updateText}>
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
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingHorizontal: 12,
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
    fontFamily: "Pretendard-Regular",
    fontWeight: 400,
    lineHeight: 30,
    color: semanticColors.text.inverse,
  },
  profileInfoContainer: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 80,
    paddingTop: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  subInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    flexWrap: "nowrap",
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
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
  },
  updateText: {
    fontSize: 10,
    color: semanticColors.brand.secondary,
  },
  gemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  gemTextRow: {
    paddingLeft: 8,
    flexDirection: "row",
  },
  gemText: {
    fontSize: 13,
    color: semanticColors.text.primary,
  },
  gemCountText: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    color: semanticColors.brand.secondary,
  },
});

export default Profile;
