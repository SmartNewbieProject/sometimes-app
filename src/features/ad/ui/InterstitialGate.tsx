// import React, { useEffect } from "react";
// import { View } from "react-native";
// import { isNativeApp, ADS_ENABLED } from "../core/env";
// import {
//   INTERSTITIAL_UNIT_IDS,
//   type InterstitialPlacement,
// } from "../config/placements";
// import { resolveInterstitialUnitId } from "../core/resolveUnitId";
// import { canShow, markShown } from "../core/frequency";

// type Props = {
//   placement?: InterstitialPlacement;
//   unitId?: string;
//   when?: boolean;
//   onAfterClose?: () => void;
//   freqKey?: string;
// };

// export default function InterstitialGate({
//   placement = "on_enter_match",
//   unitId,
//   when = true,
//   onAfterClose,
//   freqKey,
// }: Props) {
//   if (!isNativeApp || !ADS_ENABLED) return null;

//   const {
//     useInterstitialAd,
//     TestIds,
//     Platform,
//   } = require("react-native-google-mobile-ads");
//   console.log("import");

//   const prod = unitId ?? INTERSTITIAL_UNIT_IDS[placement];
//   const resolved = resolveInterstitialUnitId(prod);
//   const realId =
//     __DEV__ && process.env.EXPO_PUBLIC_ADS_USE_PROD_IN_DEV !== "true"
//       ? TestIds.INTERSTITIAL
//       : resolved || TestIds.INTERSTITIAL;

//   const { isLoaded, isClosed, load, show } = useInterstitialAd(realId);

//   useEffect(() => {
//     load();
//   }, [load]);

//   useEffect(() => {
//     if (!when) return;
//     if (freqKey && !canShow(freqKey, { max: 2, perMs: 60_000 })) return;
//     if (isLoaded) {
//       show();
//       if (freqKey) markShown(freqKey);
//     }
//   }, [when, isLoaded]);

//   useEffect(() => {
//     if (isClosed) onAfterClose?.();
//   }, [isClosed]);

//   return <View />;
// }
