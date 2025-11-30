import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { UniversityName, dayUtils, getUnivLogo, formatLastLogin } from "@/src/shared/libs";
import { semanticColors } from '@/src/shared/constants/colors';
import { IconWrapper } from "@/src/shared/ui/icons";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { Text, UniversityBadge } from "@shared/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useMatchingBackground } from "../hooks";
import { calculateTime } from "../services/calculate-time";
import type { MatchDetails } from "../types";
import { sideStyle } from "./constants";
import Time from "./time";

type PartnerProps = {
  match: MatchDetails;
};

export const Partner = ({ match }: PartnerProps) => {
  const { partner } = match;
  const { update } = useMatchingBackground();
  const { delimeter, value } = calculateTime(
    match.endOfView,
    dayUtils.create()
  );

  const onClickToPartner = () => {
    return router.navigate(`/partner/view/${match.id}`);
  };

  useEffect(() => {
    const mainProfileImageUri = match.partner?.profileImages.find(
      (image) => image.isMain
    )?.url;
    if (!mainProfileImageUri) return;
    update(mainProfileImageUri);
  }, [JSON.stringify(match.partner?.profileImages)]);

  const getUniversityLogoUrl = () => {
    if (partner?.universityDetails?.authentication) {
      const univName = partner?.universityDetails?.name as UniversityName;
      if (Object.values(UniversityName).includes(univName)) {
        return getUnivLogo(univName);
      }
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        {
          position: "relative",
          width: "100%",
          height: "100%",
          padding: 14,
        }
      ]}
    >
      <View style={styles.timeRow}>
        <Time size="sm" value={delimeter} />
        <Time size="sm" value="-" />
        {value
          ?.toString()
          .split("")
          .map((value, index) => (
            <Time
              size="sm"
              key={`${value}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
              value={value}
            />
          ))}
      </View>

      <View
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          left: 12,
          bottom: 28,
          zIndex: 10,
        }}
      >
        <Text textColor="white" weight="semibold" size="lg">
          {partner?.age}
        </Text>
        <View style={styles.universityInfo}>
          <Text textColor="white" weight="light" size="md">
            #{partner?.mbti} #{partner?.universityDetails?.name}
          </Text>
          {(() => {
            const logoUrl = getUniversityLogoUrl();
            return partner?.universityDetails?.authentication && logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={{ width: 14, height: 14, marginLeft: 5 }}
              />
            ) : (
              <IconWrapper style={{ marginLeft: 5 }} size={14}>
                <NotSecuredIcon />
              </IconWrapper>
            );
          })()}
        </View>
        <View
          style={{
            backgroundColor: "#7A4AE2",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            alignSelf: "flex-start",
            marginTop: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text textColor="white" weight="medium" size="sm">
            마지막 접속
          </Text>
          <Text textColor="white" weight="light" size="sm">
            {formatLastLogin(partner?.updatedAt)}
          </Text>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          width: 58,
          flexDirection: "column",
          height: 128,
          backgroundColor: "rgba(0, 0, 0, 0)",
          right: 0,
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
          <TouchableOpacity
            style={[styles.button, sideStyle.previousButton]}
            onPress={onClickToPartner}
          >
            <Text style={styles.buttonText}>더보기</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSection}>
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
          width: "100%",
          left: 0,
          right: 0,
          height: "40%", // 그라데이션 높이 조절
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 2,
  },
  universityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#7A4AE2',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 4,
  },
  buttonText: {
    width: 32,
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
});
