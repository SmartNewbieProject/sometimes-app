import { Platform } from "react-native";

export const isNativeApp = Platform.OS === "android"; //| Platform.OS === "ios"

// 광고 전체 on/off 스위치
export const ADS_ENABLED = process.env.EXPO_PUBLIC_ADS_ENABLED !== "false"; // 기본 true
