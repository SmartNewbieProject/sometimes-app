import { Platform } from "react-native";

export type BannerPlacement =
  | "home_banner_top"
  | "community_banner"
  | "generic_banner";

export type InterstitialPlacement = "on_enter_match" | "on_leave_home";

export type RewardedPlacement = "get_bonus_ticket" | "get_daily_coin";

// dev모드에선 TestId 사용, production에선 ProductId 사용하도록 분리 필요
export const BANNER_UNIT_IDS: Record<BannerPlacement, string> = {
  home_banner_top: Platform.select({
    ios: "cca-app-pub-3940256099942544/9214589741",
    android: "ca-app-pub-3940256099942544/9214589741",
    default: "ca-app-pub-3940256099942544/9214589741",
  })!,
  community_banner: Platform.select({
    ios: "cca-app-pub-3940256099942544/9214589741",
    android: "ca-app-pub-3940256099942544/9214589741",
    default: "ca-app-pub-3940256099942544/9214589741",
  })!,
  generic_banner: Platform.select({
    ios: "ca-app-pub-3940256099942544/9214589741",
    android: "ca-app-pub-3940256099942544/9214589741",
    default: "ca-app-pub-3940256099942544/9214589741",
  })!,
};

export const INTERSTITIAL_UNIT_IDS: Record<InterstitialPlacement, string> = {
  on_enter_match: Platform.select({
    ios: "ca-app-pub-3940256099942544/1033173712",
    android: "ca-app-pub-3940256099942544/1033173712",
    default: "ca-app-pub-3940256099942544/1033173712",
  })!,
  on_leave_home: Platform.select({
    ios: "ca-app-pub-3940256099942544/1033173712",
    android: "ca-app-pub-3940256099942544/1033173712",
    default: "ca-app-pub-3940256099942544/1033173712",
  })!,
};

export const REWARDED_UNIT_IDS: Record<RewardedPlacement, string> = {
  get_bonus_ticket: Platform.select({
    ios: "cca-app-pub-3940256099942544/5224354917",
    android: "ca-app-pub-3940256099942544/5224354917",
    default: "ca-app-pub-3940256099942544/5224354917",
  })!,
  get_daily_coin: Platform.select({
    ios: "cca-app-pub-3940256099942544/5224354917",
    android: "ca-app-pub-3940256099942544/5224354917",
    default: "ca-app-pub-3940256099942544/5224354917",
  })!,
};
