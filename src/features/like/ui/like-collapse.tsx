import { LinearGradient } from "expo-linear-gradient";
import { semanticColors } from '@/src/shared/constants/colors';
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
import ImageCollapse from "../../matching-history/ui/image-collapse";
import type { ILiked, LikedMe } from "../type/like";

interface LikeCollapseProps {
  collapse: ILiked[] | LikedMe[];
  type: string;
}

function LikeCollapse({ collapse, type }: LikeCollapseProps) {
  const textOpacity = useSharedValue(0);
  const router = useRouter();

  const [startTiming, setStartTiming] = useState(false);
  const imagesUrls = collapse.map((item) => item.mainProfileUrl);
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
  return imagesUrls && imagesUrls?.length > 0 ? (
    <View>
      <Text style={styles.text}>
        {type === "iLiked"
          ? `${name}님께서 관심을 가지신 분들이에요`
          : `${name}님께 관심을 가졌어요`}
      </Text>
      <Pressable
        style={styles.container}
        onPress={() => {
          type === "iLiked"
            ? router.push("/post-box/i-liked")
            : router.push("/post-box/liked-me");
        }}
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
            startTiming={startTiming}
            handleAllImagesLoaded={handleAllImagesLoaded}
            imageUrls={
              imagesUrls.length > 5 ? imagesUrls.slice(0, 5) : imagesUrls
            }
          />
        </View>
        {imagesUrls.length > 5 && (
          <View style={styles.more}>
            <Animated.Text
              style={[styles.moreText, textOpacityStyle]}
            >{`+${Math.abs(5 - imagesUrls.length)}`}</Animated.Text>
            <ExplodingParticles
              delay={800}
              startTiming={startTiming}
              handleEnd={() => setStartTiming(false)}
              top={24}
              left={24}
            />
          </View>
        )}
      </Pressable>
    </View>
  ) : (
    <></>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    height: 72,
    overflow: "hidden",
    borderRadius: 36,
  },
  more: {
    backgroundColor: semanticColors.brand.accent,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 20,
    width: 48,

    height: 48,
    borderRadius: "50%",
  },
  moreText: {
    color: semanticColors.text.inverse,
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
    color: semanticColors.text.primary,
    fontSize: 12,

    fontFamily: "Pretendard-Semibold",
    fontWeight: 600,
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

export default LikeCollapse;
