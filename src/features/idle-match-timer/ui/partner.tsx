import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";
import { UniversityName, dayUtils, getUnivLogo } from "@/src/shared/libs";
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
  console.log("partner", partner);
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
  }, []);

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
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: 14,
      }}
      className="flex flex-col justify-between"
    >
      <View className="flex flex-row gap-x-[2px]">
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
          만 {partner?.age}세
        </Text>
        <View className="flex flex-row items-center">
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
              borderColor: "#E7E9EC",
            }}
          />
        </View>

        <View className="w-full flex flex-row">
          <TouchableOpacity
            className="bg-primaryPurple flex-1 flex flex-row justify-end items-center pr-1"
            style={sideStyle.previousButton}
            onPress={onClickToPartner}
          >
            <Text className="w-[32px] text-white text-[12px]">더보기</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
          {/* <View className="w-[16px] bg-[#fcfaff] h-full" /> */}
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
          width: "100%",
          left: 0,
          right: 0,
          height: "40%", // 그라데이션 높이 조절
        }}
      />
    </View>
  );
};
