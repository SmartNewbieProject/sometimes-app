import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface ImageCollapseProps {
  imageUrls: string[];
  handleAllImagesLoaded: () => void;
  collapseValues: SharedValue<number>[];
}

function ImageCollapse({
  imageUrls,
  handleAllImagesLoaded,
  collapseValues,
}: ImageCollapseProps) {
  const loadedCount = useRef(0);

  useEffect(() => {
    loadedCount.current = 0;
  }, [imageUrls]);

  return (
    <View style={styles.container}>
      {imageUrls.map((url, index) => (
        <AnimatedImage
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          index={index}
          url={url}
          item={collapseValues[index]}
          onImageLoaded={() => {
            loadedCount.current += 1;
            if (loadedCount.current === imageUrls.length) {
              handleAllImagesLoaded();
            }
          }}
        />
      ))}
    </View>
  );
}

// AnimatedImage 컴포넌트는 그대로 유지

interface AnimatedImageProps {
  url: string;
  index: number;
  item: SharedValue<number>;
  onImageLoaded: () => void;
}

function AnimatedImage({
  url,
  index,
  item,
  onImageLoaded,
}: AnimatedImageProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      item.value,
      [0, 1],
      [-16 * index + 10, -16 * index]
    );
    const opacity = interpolate(item.value, [0, 1], [0, 1 - index * 0.1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <Animated.Image
      source={{ uri: url }}
      style={[styles.image, { zIndex: 5 - index }, animatedStyle]}
      onLoadEnd={onImageLoaded}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default ImageCollapse;
