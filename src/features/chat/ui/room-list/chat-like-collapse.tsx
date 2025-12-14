import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { ILiked, LikedMe } from "@/src/features/like/type/like";
import ImageCollapse from "@/src/features/matching-history/ui/image-collapse";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChatLikeCollapseProps {
  collapse: ILiked[] | LikedMe[];
  type: string;
}

function ChatLikeCollapse({ collapse, type }: ChatLikeCollapseProps) {
  const router = useRouter();

  const [startTiming, setStartTiming] = useState(false);
  const imagesUrls = collapse.map((item) => item.mainProfileUrl);

  const handleAllImagesLoaded = () => {
    setStartTiming(true);
  };

  const { profileDetails } = useAuth();
  const name = profileDetails?.name ?? "";
  return imagesUrls && imagesUrls?.length > 0 ? (
    <View style={styles.gradientContainer}>
      <LinearGradient
        start={[0.5, 0]}
        end={[0.5, 1]}
        colors={["rgba(237, 233, 247, 0)", "rgba(237, 233, 247, 1)"]}
        style={styles.background}
      />
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
            collapseValues={[]}
            isAnimated={false}
            startTiming={startTiming}
            handleAllImagesLoaded={handleAllImagesLoaded}
            imageUrls={
              imagesUrls.length > 5 ? imagesUrls.slice(0, 5) : imagesUrls
            }
          />
        </View>
        {imagesUrls.length > 5 && (
          <View style={styles.more}>
            <Text style={[styles.moreText]}>{`+${Math.abs(
              5 - imagesUrls.length
            )}`}</Text>
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

    height: 72,
    overflow: "hidden",
    borderRadius: 36,
  },
  gradientContainer: {
    paddingHorizontal: 16,
    position: "relative",
    overflow: "hidden",
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 8,
    width: "100%",
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

export default ChatLikeCollapse;
