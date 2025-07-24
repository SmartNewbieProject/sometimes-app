import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import ExplodingParticles from "../../../shared/interaction/exploding-particles";
import { useAuth } from "../../auth";
import { usePreviewHistory } from "../queries/use-preview-history";
import ImageCollapse from "./image-collapse";

function HistoryCollapse() {
  const textOpacity = useSharedValue(0);
  const router = useRouter();
  const { previewHistory = { imageUrls: [], countOfPartner: 0 }, isLoading } =
    usePreviewHistory();
  const [startTiming, setStartTiming] = useState(false);
  const previewMatchingHistory = previewHistory;
  const imagesUrls = previewMatchingHistory?.imageUrls ?? [];
  const sv1 = useSharedValue(0);
  const sv2 = useSharedValue(0);
  const sv3 = useSharedValue(0);
  const sv4 = useSharedValue(0);
  const sv5 = useSharedValue(0);

  const allValues = [sv1, sv2, sv3, sv4, sv5];
  const collapseValues = allValues.slice(
    0,
    imagesUrls.length > 5 ? 5 : imagesUrls.length
  );

  const handleAllImagesLoaded = () => {
    console.log(123);
    collapseValues.forEach((_, index) => {
      console.log(collapseValues[0].value, "collapse");
      collapseValues[index].value = withDelay(
        index * 150,
        withTiming(1, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        })
      );
    });
    textOpacity.value = withDelay(800, withTiming(1, { duration: 100 }));
    setStartTiming(true);
  };

  const textOpacityStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const { profileDetails } = useAuth();
  const name = profileDetails?.name ?? "";
  return !isLoading &&
    previewMatchingHistory &&
    previewMatchingHistory?.imageUrls.length > 0 ? (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.text}>{name}님과 매칭된 상대를 확인해보세요!</Text>
      <Pressable
        style={styles.container}
        onPress={() => router.push("/matching-history")}
      >
        <LinearGradient
          start={[0, 1]}
          end={[1, 0]}
          colors={["rgba(177, 144, 249, 1)", "rgba(177, 144, 249, 0)"]}
          style={styles.background}
        />
        <View style={styles.contentContainer}>
          <ImageCollapse
            collapseValues={collapseValues}
            handleAllImagesLoaded={handleAllImagesLoaded}
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
              <ExplodingParticles
                delay={800}
                startTiming={startTiming}
                handleEnd={() => setStartTiming(false)}
                top={24}
                left={24}
              />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  ) : (
    <></>
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
