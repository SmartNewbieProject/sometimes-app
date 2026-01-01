import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useModal } from "@/src/shared/hooks/use-modal";
import { UniversityName, getUnivLogo, formatLastLogin } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import LockProfileIcon from "@assets/icons/lock-profile.svg";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import NotSecuredIcon from "@assets/icons/shield-not-secured.svg";
import { useFeatureCost } from "@features/payment/hooks";
import { ModalStyles } from "@shared/hooks";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Pressable,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";
import { useCommingSoon } from "../../admin/hooks";
import { useMatchingBackground } from "../../idle-match-timer/hooks";
import { useUnlockProfile } from "../queries/use-unlock-profile";
import type { MatchingHistoryDetails } from "../type";


interface MatchingHistoryCardProps {
  item: MatchingHistoryDetails;
}

function MatchingHistoryCard({ item }: MatchingHistoryCardProps) {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const size =
    Dimensions.get("window").width > 468
      ? 218
      : (Dimensions.get("window").width - 32) / 2;

  const { update } = useMatchingBackground();
  const unlockProfile = useUnlockProfile(item.matchId);
  const router = useRouter();
  const { t } = useTranslation();
  const onClickToPartner = () => {
    return router.navigate(`/partner/view/${item.matchId}`);
  };

  useEffect(() => {
    if (!item.imageUrl) return;
    update(item.imageUrl);
  }, [item.imageUrl, update]);

  const getUniversityLogoUrl = () => {
    if (item?.universityAuthentication) {
      const univName = item.universityName as UniversityName;
      if (Object.values(UniversityName).includes(univName)) {
        return getUnivLogo(univName);
      }
    }
    return null;
  };
  const onClickMoreButton = () => {
    if (item.blinded) {
      showModal({
        showLogo: true,
        customTitle: (
            <View style={ModalStyles.title}>
              <Text textColor="black" size="20" weight="bold">
                {t("features.matching-history.ui.matching_history_card.modal_title", { cost: featureCosts?.PROFILE_OPEN })}
              </Text>
            </View>
        ),
        children: (
          <View style={ModalStyles.content}>
            <Text style={ModalStyles.description} textColor="disabled">
              {t("features.matching-history.ui.matching_history_card.modal_description")}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t("ok"),
          onClick: unlockProfile.mutateAsync,
        },
        secondaryButton: {
          text: t("no"),
          onClick: hideModal,
        },
      });
    } else {
      router.push(`/partner/view/${item.matchId}`);
    }
  };
  return (
    <Pressable onPress={onClickMoreButton}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={[styles.imageBackground, { width: size, height: size }]}
      >
        {item.blinded && (
          <>
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.lockIconContainer}>
              <LockProfileIcon width={32} height={32} />
            </View>
          </>
        )}
        <View
          style={[styles.cardContainer, { width: size, height: size }]}
        >
          <View style={styles.infoContainer}>
            <Text textColor="white" weight="semibold" size="20">
              {item.age}
            </Text>
            <View style={styles.rowCenter}>
              <Text textColor="white" weight="light" size="10">
                {item.mbti ? `#${item?.mbti}` : ""} #{item.universityName}
              </Text>
              {(() => {
                const logoUrl = getUniversityLogoUrl();
                return item.universityAuthentication && logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.universityLogo}
                  />
                ) : (
                  <IconWrapper style={styles.iconMarginLeft} size={10}>
                    <NotSecuredIcon />
                  </IconWrapper>
                );
              })()}
            </View>
            <View style={styles.lastLoginBadge}>
              <Text textColor="white" weight="medium" size="10">
                {t("features.matching-history.ui.matching_history_card.last_login_label")}
              </Text>
              <Text textColor="white" weight="light" size="10">
                {formatLastLogin(item.lastLogin)}
              </Text>
            </View>
          </View>

          <View style={styles.moreButtonContainer}>
            <View style={styles.topSpacer}>
              <View style={styles.topSpacerInner} />
            </View>

            <View style={styles.fullWidthRow}>
              <Pressable
                style={[
                  styles.previousButton,
                  styles.pressableContent,
                  {
                    backgroundColor: item.blinded
                      ? "#452D79"
                      : colors.primaryPurple,
                  },
                ]}
                onPress={onClickToPartner}
              >
                <Text textColor="white" style={styles.buttonText}>
                  {item.blinded ? t("features.matching-history.ui.matching_history_card.profile_unlock_button") : t("features.matching-history.ui.matching_history_card.more_button")}
                </Text>
                <IconWrapper width={6} height={6}>
                  <ArrowRight />
                </IconWrapper>
              </Pressable>
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.bottomSpacerInner} />
            </View>
          </View>
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]}
            style={[styles.gradientOverlay, { width: size }]}
          />
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    margin: 8,
  },
  lockIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previousButton: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    height: 68,
  },
  someReceivedBadge: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 8,
    left: 8,
    paddingVertical: 4,
  },
  someReceivedText: {
    lineHeight: 10,
    fontWeight: 700,
    fontSize: 10,
    fontFamily: "Pretendard-Bold",
    color: colors.primaryPurple,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidthRow: {
    width: '100%',
    flexDirection: 'row',
  },
  pressableContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 4,
  },
  buttonText: {
    width: 20,
    fontSize: 7,
  },
  bottomContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContainer: {
    position: 'relative',
    padding: 14,
    borderRadius: 30,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  infoContainer: {
    position: 'absolute',
    flexDirection: 'column',
    left: 10,
    bottom: 10,
    zIndex: 10,
  },
  lastLoginBadge: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  moreButtonContainer: {
    position: 'absolute',
    width: 34,
    flexDirection: 'column',
    height: 128,
    backgroundColor: 'transparent',
    right: 1,
    zIndex: 10,
    bottom: 62,
  },
  topSpacer: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  topSpacerInner: {
    borderBottomRightRadius: 16,
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
  },
  bottomSpacerInner: {
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  universityLogo: {
    width: 10,
    height: 10,
    marginLeft: 5,
  },
  iconMarginLeft: {
    marginLeft: 5,
  },
});

export default MatchingHistoryCard;