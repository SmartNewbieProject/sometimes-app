import React, { useRef } from "react";
import { Platform, View, StyleProp, ViewStyle } from "react-native";
import { BANNER_UNIT_IDS, type BannerPlacement } from "../config/placements";
import { resolveBannerUnitId } from "../core/resolveUnitId";

export type BannerProps = {
  unitId?: string;
  placement?: BannerPlacement;
  containerStyle?: StyleProp<ViewStyle>;
  size?:
    | "ANCHORED_ADAPTIVE_BANNER"
    | "ADAPTIVE_BANNER"
    | "BANNER"
    | "LARGE_BANNER"
    | "FULL_BANNER"
    | "LEADERBOARD"
    | "MEDIUM_RECTANGLE";
};

export default function Banner({
  unitId,
  placement = "generic_banner",
  containerStyle,
  size = "ANCHORED_ADAPTIVE_BANNER",
}: BannerProps) {
  // 웹은 광고 모듈이 없으므로 아무것도 렌더하지 않음
  if (Platform.OS === "web") return null;

  // 네이티브에서만 동적 require → 웹 번들이 이 모듈을 포함하지 않음
  const {
    BannerAd,
    BannerAdSize,
    useForeground,
    TestIds,
  } = require("react-native-google-mobile-ads");

  const ref = useRef<any>(null);

  // 개발: TestIds / 운영: prodUnitId
  const prodUnitId = unitId ?? BANNER_UNIT_IDS[placement];
  const resolvedProd = resolveBannerUnitId(prodUnitId);
  const resolvedUnitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : resolvedProd || TestIds.ADAPTIVE_BANNER;

  // size 매핑
  const mappedSize =
    BannerAdSize[size] ?? BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  // iOS: 포그라운드 복귀 시 공백 방지
  useForeground?.(() => {
    if (Platform.OS === "ios") ref.current?.load?.();
  });

  return (
    <View
      style={[
        { alignItems: "center", width: "100%", marginVertical: 12 },
        containerStyle,
      ]}
    >
      <BannerAd ref={ref} unitId={resolvedUnitId} size={mappedSize} />
    </View>
  );
}
