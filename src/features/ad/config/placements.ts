import { Platform } from "react-native";

export type BannerPlacement =
  | "home_banner"
  | "community_banner"
  | "generic_banner";

export type InterstitialPlacement = "on_enter_match" | "on_leave_home";

export type RewardedPlacement = "get_bonus_ticket" | "get_daily_coin";

export type NativePlacement = "home_native_card" | "community_native_card";

// dev모드에선 TestId 사용, production에선 ProductId 사용하도록 분리 필요
export const BANNER_UNIT_IDS: Record<BannerPlacement, string> = {
  home_banner: Platform.select({
    ios: "ca-app-pub-3940256099942544/9214589741", //ios키 미발급(테스트 키)
    android: "ca-app-pub-6421100966496878/7153546411", //production 광고 키
  })!,
  community_banner: Platform.select({
    ios: "ca-app-pub-6421100966496878/8043033789", //ios키 미발급
    android: "ca-app-pub-6421100966496878/8043033789", //production 광고 키
  })!,
  generic_banner: Platform.select({
    ios: "ca-app-pub-3940256099942544/9214589741", //ios키 미발급
    android: "ca-app-pub-3940256099942544/9214589741",
  })!,
};

export const INTERSTITIAL_UNIT_IDS: Record<InterstitialPlacement, string> = {
  on_enter_match: Platform.select({
    ios: "ca-app-pub-3940256099942544/1033173712", //ios키 미발급
    android: "ca-app-pub-3940256099942544/1033173712",
  })!,
  on_leave_home: Platform.select({
    ios: "ca-app-pub-3940256099942544/1033173712", //ios키 미발급
    android: "ca-app-pub-3940256099942544/1033173712",
  })!,
};

export const REWARDED_UNIT_IDS: Record<RewardedPlacement, string> = {
  get_bonus_ticket: Platform.select({
    ios: "ca-app-pub-3940256099942544/5224354917", //ios키 미발급
    android: "ca-app-pub-3940256099942544/5224354917",
  })!,
  get_daily_coin: Platform.select({
    ios: "ca-app-pub-3940256099942544/5224354917", //ios키 미발급
    android: "ca-app-pub-3940256099942544/5224354917",
  })!,
};

export const NATIVE_UNIT_IDS: Record<NativePlacement, string> = {
  home_native_card: Platform.select({
    ios: "ca-app-pub-6421100966496878/3403088807", //ios키 미발급
    android: "ca-app-pub-6421100966496878/3403088807",
  })!,
  community_native_card: Platform.select({
    ios: "ca-app-pub-3940256099942544/2247696110", //ios키 미발급
    android: "ca-app-pub-3940256099942544/2247696110",
  })!,
};
