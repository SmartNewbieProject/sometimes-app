import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated,{
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
  const { t } = useTranslation();
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

  useEffect(() => {
    if (startTiming) {
      collapseValues.forEach((_, index) => {
        collapseValues[index].value = withDelay(
          index * 150,
          withTiming(1, {
            duration: 150,
            easing: Easing.inOut(Easing.ease),
          })
        );
      });
      textOpacity.value = withDelay(800, withTiming(1, { duration: 100 }));
    }
  }, [startTiming]);

  const handleAllImagesLoaded = () => {
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
    <View style={{ overflow: "hidden", borderRadius: 20 }}>
      <LinearGradient
        start={[0, 0]}
        end={[0, 1]}
        colors={["rgba(255, 255, 255, 0.80)", "rgba(230, 218, 255, 0.80)"]}
        style={styles.background}
      />
      <Pressable
        style={styles.container}
        onPress={() => router.push("/matching-history")}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { fontSize: 18 }]}>
            혹시 놓친 <Text style={styles.titleStrong}>인연</Text>이 있을지도
            몰라요
          </Text>
          <Text style={styles.description}>
            {t("features.matching-history.ui.history_collapse.description_1")}
          </Text>
          <Text style={styles.description}>
            {t("features.matching-history.ui.history_collapse.description_2")}
          </Text>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.contentContainer}>
            <ImageCollapse
              collapseValues={collapseValues}
              startTiming={startTiming}
              handleAllImagesLoaded={handleAllImagesLoaded}
              imageUrls={
                previewMatchingHistory.imageUrls.length > 5
                  ? previewMatchingHistory.imageUrls.slice(0, 5)
                  : previewMatchingHistory.imageUrls
              }
            />
          </View>
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
    borderWidth: 1,

    borderColor: "#E1D9FF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bottomContainer: {
    width: "100%",
    position: "relative",
    marginTop: 2,
    alignItems: "center",
    flexDirection: "row",
    minHeight: 72,
  },
  content: {
    gap: 4,
    flex: 1,
    paddingLeft: 4,
    paddingRight: 8,
  },
  title: {
    fontWeight: 600,

    fontFamily: "Pretendard-SemiBold",
    lineHeight: 21.6,
    color: "#4A4A4A",
  },
  titleStrong: {
    fontWeight: 800,
    fontFamily: "Pretendard-ExtraBold",
    color: "#7A4AE2",
  },
  description: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
    lineHeight: 14.4,
    color: "#A892D7",
  },

  more: {
    backgroundColor: "#A892D7",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    width: 48,

    height: 48,
    borderRadius: "50%",
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

  contentContainer: {
    position: "absolute",
    top: 0,

    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default HistoryCollapse;