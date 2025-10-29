import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import {
  INTERSTITIAL_UNIT_IDS,
  type InterstitialPlacement,
} from "../config/placements";
import { resolveInterstitialUnitId } from "../core/resolveUnitId";
import { canShow, markShown } from "../core/frequency";

type Props = {
  placement?: InterstitialPlacement;
  unitId?: string;
  when?: boolean; // true일 때만 시도
  onAfterClose?: () => void; // 닫힌 후 콜백
  freqKey?: string; // 빈도 제한 키(선택)
};

export default function InterstitialGate({
  placement = "on_enter_match",
  unitId,
  when = true,
  onAfterClose,
  freqKey,
}: Props) {
  if (Platform.OS === "web") return null;

  const {
    useInterstitialAd,
    TestIds,
  } = require("react-native-google-mobile-ads");

  const prodId = unitId ?? INTERSTITIAL_UNIT_IDS[placement];
  const resolvedProd = resolveInterstitialUnitId(prodId);
  const realId = __DEV__
    ? TestIds.INTERSTITIAL
    : resolvedProd || TestIds.INTERSTITIAL;

  const { isLoaded, isClosed, load, show } = useInterstitialAd(realId);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!when) return;
    if (freqKey && !canShow(freqKey, { max: 2, perMs: 60_000 })) return;
    if (isLoaded) {
      show();
      if (freqKey) markShown(freqKey);
    }
  }, [when, isLoaded]);

  useEffect(() => {
    if (isClosed) onAfterClose?.();
  }, [isClosed]);

  return <View />;
}
