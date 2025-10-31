// src/features/ad/ui/Banner.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { isNativeApp, ADS_ENABLED } from "../core/env";
import { BANNER_UNIT_IDS, type BannerPlacement } from "../config/placements";
import { resolveBannerUnitId } from "../core/resolveUnitId";

type Props = {
  unitId?: string;
  placement?: BannerPlacement;
  size?:
    | "ANCHORED_ADAPTIVE_BANNER"
    | "ADAPTIVE_BANNER"
    | "BANNER"
    | "LARGE_BANNER"
    | "FULL_BANNER"
    | "LEADERBOARD"
    | "MEDIUM_RECTANGLE";
  containerStyle?: any;
};

export default function Banner({
  unitId,
  placement = "generic_banner",
  size = "ANCHORED_ADAPTIVE_BANNER",
  containerStyle,
}: Props) {
  if (Platform.OS === "web") return null;

  const [gma, setGma] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("react-native-google-mobile-ads");
        if (mounted) setGma(mod);
      } catch (e) {
        if (__DEV__) console.warn("[ADS][Banner] GMA import failed", e);
        if (mounted) setGma(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!gma) return null;

  const { BannerAd, BannerAdSize, useForeground, TestIds } = gma;

  const ref = useRef<any>(null);

  const finalUnitId = useMemo(() => {
    const prodUnitId = unitId ?? BANNER_UNIT_IDS[placement];
    const resolved = resolveBannerUnitId(prodUnitId);

    return __DEV__ && process.env.EXPO_PUBLIC_ADS_USE_PROD_IN_DEV !== "true"
      ? TestIds.ADAPTIVE_BANNER
      : resolved || TestIds.ADAPTIVE_BANNER;
  }, [unitId, placement, gma]);

  const mappedSize =
    BannerAdSize[size] ?? BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  // iOS 포그라운드 복귀 시 배너 리로드
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
      <BannerAd ref={ref} unitId={finalUnitId} size={mappedSize} />
    </View>
  );
}
