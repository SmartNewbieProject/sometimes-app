import colors , { semanticColors } from "@/src/shared/constants/colors";
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
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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
              이전에 만났던 분께 다시 연락하기 위해 구슬{" "}
              {featureCosts?.PROFILE_OPEN}개를 사용할까요?
            </Text>
          </View>
        ),
        children: (
          <View style={ModalStyles.content}>
            <Text style={[ModalStyles.description, styles.modalDescription]}>
              시간이 지났지만 다시 인연을 이어가고 싶다면, 용기 내어 먼저 다가가
              보세요.
            </Text>
          </View>
        ),
        primaryButton: {
          text: "네, 해볼래요",
          onClick: unlockProfile.mutateAsync,
        },
        secondaryButton: {
          text: "아니요",
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
        <View
          style={[
            styles.cardContainer,
            {
              width: size,
              height: size,
            }
          ]}
        >
          {item.blinded && (
            <View style={styles.lock}>
              <LockProfileIcon width={40} height={60} />
            </View>
          )}
          <View
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              left: 10,
              bottom: 10,
              zIndex: 10,
            }}
          >
            <Text textColor="white" weight="semibold" size="20">
              {item.age}
            </Text>
            <View style={styles.infoRow}>
              <Text textColor="white" weight="light" size="10">
                {item.mbti ? `#${item?.mbti}` : ""} #{item.universityName}
              </Text>
              {(() => {
                const logoUrl = getUniversityLogoUrl();
                return item.universityAuthentication && logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: 10, height: 10, marginLeft: 5 }}
                  />
                ) : (
                  <IconWrapper style={{ marginLeft: 5 }} size={10}>
                    <NotSecuredIcon />
                  </IconWrapper>
                );
              })()}
            </View>
            <View
              style={{
                backgroundColor: "#7A4AE2",
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 3,
                alignSelf: "flex-start",
                marginTop: 3,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Text textColor="white" weight="medium" size="10">
                마지막 접속
              </Text>
              <Text textColor="white" weight="light" size="10">
                {formatLastLogin(item.lastLogin)}
              </Text>
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              width: 34,
              flexDirection: "column",
              height: 128,
              backgroundColor: "rgba(0, 0, 0, 0)",
              right: 1,
              zIndex: 10,
              bottom: 62,
            }}
          >
            <View
              style={{
                width: "100%",
                position: "relative",
                backgroundColor: "rgba(0, 0, 0, 0)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  borderBottomRightRadius: 16,
                  borderTopEndRadius: 16,
                  height: 35,
                  width: "100%",
                  borderColor: semanticColors.border.default,
                }}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.previousButton,
                  {
                    backgroundColor: item.blinded
                      ? "#452D79"
                      : colors.primaryPurple,
                  },
                ]}
                onPress={onClickToPartner}
              >
                <Text style={styles.buttonText}>
                  {item.blinded ? "프로필\n풀기" : "더보기"}
                </Text>
                <IconWrapper width={6} height={6}>
                  <ArrowRight />
                </IconWrapper>
              </Pressable>
            </View>
            <View
              style={[
                styles.bottomCorner,
                {
                  overflow: "hidden",
                }
              ]}
            >
              <View
                style={{
                  borderTopEndRadius: 16,
                  height: 35,
                  width: "100%",
                }}
              />
            </View>
          </View>
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              width: size,
              left: 0,
              right: 0,
              height: "40%", // 그라데이션 높이 조절
            }}
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
  lock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
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
  cardContainer: {
    position: "relative",
    padding: 14,
    boxSizing: "border-box",
    borderRadius: 30,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row'
  },
  buttonText: {
    width: 20,
    color: semanticColors.text.inverse,
    fontSize: 7
  },
  bottomCorner: {
    width: '100%',
    position: 'relative'
  },
  modalDescription: {
    color: semanticColors.text.disabled
  }
});

export default MatchingHistoryCard;
