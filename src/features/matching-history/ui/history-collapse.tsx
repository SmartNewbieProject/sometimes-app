import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import ExplodingParticles from "../../../shared/interaction/exploding-particles";
import { useAuth } from "../../auth";
import { usePreviewHistory } from "../queries/use-preview-history";
import type { PreviewMatchingHistory } from "../type";
import ImageCollapse from "./image-collapse";

function HistoryCollapse() {
  const textOpacity = useSharedValue(0);
  const { previewHistory, isLoading } = usePreviewHistory();
  const previewMatchingHistory = previewHistory;
  useEffect(() => {
    textOpacity.value = withDelay(800, withTiming(1, { duration: 100 }));
  }, []);
  const textOpacityStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const { profileDetails } = useAuth();
  const name = profileDetails?.name ?? "";
  console.log("previewMatching", previewHistory);
  return (
    !isLoading &&
    previewMatchingHistory &&
    previewMatchingHistory?.imageUrls.length > 0 && (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.text}>{name}님과 매칭된 상대를 확인해보세요!</Text>
        <View style={styles.container}>
          <LinearGradient
            start={[0, 1]}
            end={[1, 0]}
            colors={["rgba(177, 144, 249, 1)", "rgba(177, 144, 249, 0)"]}
            style={styles.background}
          />
          <View style={styles.contentContainer}>
            <ImageCollapse
              imageUrls={
                previewMatchingHistory.imageUrls.length > 5
                  ? previewMatchingHistory.imageUrls.slice(0, 5)
                  : previewMatchingHistory.imageUrls
              }
            />
            {previewMatchingHistory.imageUrls.length > 5 && (
              <View style={styles.more}>
                <Animated.Text
                  style={[styles.moreText, textOpacityStyle]}
                >{`+${Math.abs(
                  5 - previewMatchingHistory.countOfPartner
                )}`}</Animated.Text>
                <ExplodingParticles top={24} left={24} />
              </View>
            )}
          </View>
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",

    width: "100%",
    height: 72,
    overflow: "hidden",
    borderRadius: 36,
  },
  more: {
    backgroundColor: "#A892D7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: "50%",
    transform: [{ translateX: -48 }],
  },
  moreText: {
    color: "#fff",
    fontSize: 14,
  },
  background: {
    top: 0,
    left: 0,
    zIndex: -1,
    bottom: 0,
    right: 0,
    position: "absolute",
  },
  text: {
    marginBottom: 5,
    marginLeft: 14,
    color: "#5A269A",
    fontSize: 12,

    fontFamily: "Pretendard-Semibold",
  },
  contentContainer: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 24,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default HistoryCollapse;
