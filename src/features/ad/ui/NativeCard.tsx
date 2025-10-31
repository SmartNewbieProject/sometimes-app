// // src/features/ad/NativeCard.tsx
// import React, { useCallback, useMemo, useState } from "react";
// import {
//   Platform,
//   View,
//   Text,
//   Image,
//   ActivityIndicator,
//   StyleSheet,
//   ViewStyle,
// } from "react-native";
// import { resolveNativeUnitId } from "../core/resolveUnitId";
// import { NATIVE_UNIT_IDS, type NativePlacement } from "../config/placements";
// import { isNativeApp, ADS_ENABLED } from "../core/env";

// let RNGoogleAds: any = null;
// if (Platform.OS !== "web") {
//   RNGoogleAds = require("react-native-google-mobile-ads");
//   console.log("import");
// }

// type Props = {
//   placement: Extract<
//     NativePlacement,
//     "home_native_card" | "community_native_card"
//   >;
//   cardStyle?: ViewStyle;
//   mediaAspectRatio?: "landscape" | "portrait" | "square";
//   renderPlaceholder?: () => React.ReactNode;
//   renderError?: (e?: unknown) => React.ReactNode;
// };

// export default function NativeCard({
//   placement,
//   mediaAspectRatio = "landscape",
// }: Props) {
//   if (!isNativeApp || !ADS_ENABLED) return null;

//   const GMA = require("react-native-google-mobile-ads");
//   const {
//     NativeAdView,
//     HeadlineView,
//     TaglineView,
//     CallToActionView,
//     IconView,
//     AdvertiserView,
//     MediaView,
//     StarRatingView,
//     TestIds,
//     NativeMediaAspectRatio,
//   } = GMA;

//   const unitId = useMemo(() => {
//     const prod = resolveNativeUnitId(placement);
//     return __DEV__ && process.env.EXPO_PUBLIC_ADS_USE_PROD_IN_DEV !== "true"
//       ? TestIds.NATIVE_ADVANCED
//       : prod || TestIds.NATIVE_ADVANCED;
//   }, [placement]);

//   const [loading, setLoading] = useState(true);
//   const [failed, setFailed] = useState<unknown>(null);

//   const onAdLoaded = useCallback(() => {
//     setLoading(false);
//     setFailed(null);
//   }, []);
//   const onAdFailedToLoad = useCallback((e: unknown) => {
//     setLoading(false);
//     setFailed(e);
//     if (__DEV__) console.log("[NativeCard] onAdFailedToLoad", e);
//   }, []);

//   const aspect =
//     mediaAspectRatio === "portrait"
//       ? 0.8
//       : mediaAspectRatio === "square"
//       ? 1
//       : 1.7;

//   return (
//     <NativeAdView
//       adUnitID={unitId}
//       mediaAspectRatio={
//         mediaAspectRatio === "portrait"
//           ? NativeMediaAspectRatio.PORTRAIT
//           : mediaAspectRatio === "square"
//           ? NativeMediaAspectRatio.SQUARE
//           : NativeMediaAspectRatio.LANDSCAPE
//       }
//       onAdLoaded={onAdLoaded}
//       onAdFailedToLoad={onAdFailedToLoad}
//       style={styles.card}
//     >
//       {loading && !failed ? (
//         <View style={[styles.center, { minHeight: 120 }]}>
//           <ActivityIndicator />
//         </View>
//       ) : failed ? (
//         <View style={[styles.center, { minHeight: 120 }]}>
//           <Text style={styles.dim}>광고 로드 실패</Text>
//         </View>
//       ) : (
//         <>
//           <View style={styles.headerRow}>
//             <IconView style={styles.icon} />
//             <View style={styles.headerText}>
//               <HeadlineView style={styles.headline} numberOfLines={1} />
//               <Text style={styles.sponsored}>AD · Sponsored</Text>
//             </View>
//           </View>
//           <MediaView
//             style={{
//               width: "100%",
//               aspectRatio: aspect,
//               borderRadius: 12,
//               overflow: "hidden",
//             }}
//           />
//           <TaglineView style={styles.body} numberOfLines={2} />
//           <AdvertiserView style={styles.advertiser} numberOfLines={1} />
//           <StarRatingView style={{ height: 16, marginTop: 4 }} />
//           <CallToActionView
//             style={styles.ctaBtn}
//             textStyle={styles.ctaText}
//             allowFontScaling={false}
//           />
//         </>
//       )}
//     </NativeAdView>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width: "100%",
//     borderRadius: 16,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "rgba(0,0,0,0.08)",
//     backgroundColor: "#fff",
//     padding: 12,
//     gap: 10,
//   },
//   center: { alignItems: "center", justifyContent: "center" },
//   headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
//   icon: { width: 32, height: 32, borderRadius: 6, backgroundColor: "#eee" },
//   headerText: { flex: 1 },
//   headline: { fontSize: 16, fontWeight: "600" },
//   sponsored: { marginTop: 2, fontSize: 11, color: "#8C8C8C" },
//   body: { fontSize: 13, color: "#4D4D4D" },
//   advertiser: { fontSize: 12, color: "#8C8C8C" },
//   ctaBtn: {
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: "#5B7CFA",
//     minWidth: 120,
//     alignItems: "center",
//   },
//   ctaText: { color: "#fff", fontWeight: "700" },
//   dim: { fontSize: 12, color: "#8C8C8C" },
// });
