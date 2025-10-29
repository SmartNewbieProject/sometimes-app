import React, { useEffect } from "react";
import { Platform, Button } from "react-native";
import {
  REWARDED_UNIT_IDS,
  type RewardedPlacement,
} from "../config/placements";
import { resolveRewardedUnitId } from "../core/resolveUnitId";

type Props = {
  placement?: RewardedPlacement;
  unitId?: string;
  title?: string;
  onReward?: (reward: { amount: number; type: string }) => void;
};

export default function RewardedButton({
  placement = "get_daily_coin",
  unitId,
  title = "광고 보고 보상받기",
  onReward,
}: Props) {
  if (Platform.OS === "web") return null;

  const { useRewardedAd, TestIds } = require("react-native-google-mobile-ads");

  const prodId = unitId ?? REWARDED_UNIT_IDS[placement];
  const resolvedProd = resolveRewardedUnitId(prodId);
  const realId = __DEV__ ? TestIds.REWARDED : resolvedProd || TestIds.REWARDED;

  const { isLoaded, isClosed, isShowing, isEarnedReward, reward, load, show } =
    useRewardedAd(realId);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isEarnedReward && reward) {
      onReward?.({ amount: reward.amount ?? 0, type: reward.type ?? "reward" });
      // 서버 보상 지급 로직 호출 위치
    }
  }, [isEarnedReward, reward]);

  return (
    <Button
      title={isLoaded ? title : "광고 로딩 중..."}
      disabled={!isLoaded}
      onPress={() => show()}
    />
  );
}
