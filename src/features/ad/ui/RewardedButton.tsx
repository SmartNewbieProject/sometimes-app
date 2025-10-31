// import React, { useEffect } from "react";
// import { Button } from "react-native";
// import { isNativeApp, ADS_ENABLED } from "../core/env";
// import {
//   REWARDED_UNIT_IDS,
//   type RewardedPlacement,
// } from "../config/placements";
// import { resolveRewardedUnitId } from "../core/resolveUnitId";

// type Props = {
//   placement?: RewardedPlacement;
//   unitId?: string;
//   title?: string;
//   onReward?: (reward: { amount: number; type: string }) => void;
// };

// export default function RewardedButton({
//   placement = "get_daily_coin",
//   unitId,
//   title = "광고 보고 보상받기",
//   onReward,
// }: Props) {
//   if (!isNativeApp || !ADS_ENABLED) return null;

//   const { useRewardedAd, TestIds } = require("react-native-google-mobile-ads");
//   console.log("import");

//   const prod = unitId ?? REWARDED_UNIT_IDS[placement];
//   const resolved = resolveRewardedUnitId(prod);
//   const realId =
//     __DEV__ && process.env.EXPO_PUBLIC_ADS_USE_PROD_IN_DEV !== "true"
//       ? TestIds.REWARDED
//       : resolved || TestIds.REWARDED;

//   const { isLoaded, isEarnedReward, reward, load, show } =
//     useRewardedAd(realId);

//   useEffect(() => {
//     load();
//   }, [load]);
//   useEffect(() => {
//     if (isEarnedReward && reward) {
//       onReward?.({ amount: reward.amount ?? 0, type: reward.type ?? "reward" });
//     }
//   }, [isEarnedReward, reward]);

//   return (
//     <Button
//       title={isLoaded ? title : "광고 로딩 중..."}
//       disabled={!isLoaded}
//       onPress={() => show()}
//     />
//   );
// }
