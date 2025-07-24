import colors from "@/src/shared/constants/colors";
import { UniversityName, getUnivLogo } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import LockProfileIcon from "@assets/icons/lock-profile.svg";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import NotSecuredIcon from "@assets/icons/shield-not-secured.svg";
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
import type { MatchingHistoryDetails } from "../type";

interface MatchingHistoryCardProps {
  item: MatchingHistoryDetails;
}

function MatchingHistoryCard({ item }: MatchingHistoryCardProps) {
  const size =
    Dimensions.get("window").width / 2 > 300
      ? 280
      : Dimensions.get("window").width / 2 < 180
      ? 140
      : 180;

  const { update } = useMatchingBackground();
  const showCommingSoonModal = useCommingSoon();
  const router = useRouter();
  const onClickToPartner = () => {
    return router.navigate(`/partner/view/${item.matchId}`);
  };
  console.log("size", Dimensions.get("window").width, size);
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
      showCommingSoonModal();
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
          style={{
            position: "relative",
            width: size,
            height: size,
            padding: 14,
            borderRadius: 30,
          }}
          className="flex flex-col justify-between"
        >
          {item.blinded && (
            <View style={styles.lock}>
              <LockProfileIcon width={40} height={60} />
            </View>
          )}

          <View style={styles.someReceivedBadge}>
            <RNText style={styles.someReceivedText}>
              {item.someReceived ? "들어온 썸" : "보낸 썸"}
            </RNText>
          </View>
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
              만 {item.age}세
            </Text>
            <View className="flex flex-row items-center">
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
                  borderColor: "#E7E9EC",
                }}
              />
            </View>

            <View className="w-full flex flex-row">
              <Pressable
                className={
                  " flex-1 flex flex-row justify-end items-center pr-1"
                }
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
                <Text className="w-[20px] text-white text-[7px]">
                  {item.blinded ? "프로필\n풀기" : "더보기"}
                </Text>
                <IconWrapper width={6} height={6}>
                  <ArrowRight />
                </IconWrapper>
              </Pressable>
            </View>
            <View
              className="w-full relative"
              style={{
                overflow: "hidden",
              }}
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
    margin: 10,
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
    backgroundColor: "#F5F1FF",
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
    fontFamily: "Pretendard-ExtraBold",
    color: colors.primaryPurple,
  },
});

export default MatchingHistoryCard;
