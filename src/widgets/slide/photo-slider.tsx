import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import XIcon from "@assets/icons/white-x-icon.svg";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenW, height: screenH } = Dimensions.get("window");

type PhotoSliderProps = {
  images: string[];
  visible: boolean;
  onClose: () => void;
  initialIndex?: number;
};

export default function PhotoSlider({
  images,
  visible,
  onClose,
  initialIndex = 0,
}: PhotoSliderProps) {
  const realImages = Array.isArray(images) ? images : [images];
  const isSingle = realImages.length <= 1;
  const { profileDetails, my } = useAuth();
  const array = isSingle
    ? [...realImages]
    : [realImages[realImages.length - 1], ...realImages, realImages[0]];

  const calcInitialFocus = (idx: number) =>
    isSingle
      ? 0
      : Math.min(Math.max(idx, 0), realImages.length - 1) + (isSingle ? 0 : 1);

  const [focusIndex, setFocusIndex] = useState<number>(
    calcInitialFocus(initialIndex)
  );
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const pendingRef = useRef<boolean>(true);

  useEffect(() => {
    if (containerWidth > 0) {
      bannerAnim.setValue(-focusIndex * containerWidth);
      pendingRef.current = true;
    }
  }, [containerWidth]);

  useEffect(() => {
    if (visible) {
      const newIndex = calcInitialFocus(initialIndex);
      setFocusIndex(newIndex);
      bannerAnim.setValue(-newIndex * (containerWidth || screenW));
    }
  }, [initialIndex, visible, containerWidth]);

  useEffect(() => {
    if (containerWidth > 0) {
      bannerAnim.setValue(-focusIndex * containerWidth);
    }
  }, [focusIndex]);

  const clampIndex = (idx: number) => {
    return Math.max(0, Math.min(idx, array.length - 1));
  };
  const moveToIndex = (nextIndexRaw: number) => {
    if (containerWidth === 0 || !pendingRef.current) return;

    const nextIndex = clampIndex(nextIndexRaw);

    pendingRef.current = false;

    Animated.timing(bannerAnim, {
      toValue: -nextIndex * containerWidth,
      useNativeDriver: true,
      duration: 250,
    }).start(({ finished }) => {
      if (!finished) {
        pendingRef.current = true;
        return;
      }

      let finalIndex = nextIndex;

      if (!isSingle && nextIndex === array.length - 1) {
        finalIndex = 1;
        bannerAnim.setValue(-finalIndex * containerWidth);
      } else if (!isSingle && nextIndex === 0) {
        finalIndex = array.length - 2;
        bannerAnim.setValue(-finalIndex * containerWidth);
      }

      setFocusIndex(finalIndex);
      pendingRef.current = true;
    });
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isSingle,
    onMoveShouldSetPanResponder: (_evt, gestureState) => {
      if (isSingle) return false;
      return (
        Math.abs(gestureState.dx) > 10 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      );
    },
    onPanResponderGrant: () => {},
    onPanResponderMove: () => {},

    onPanResponderRelease: (_evt, gestureState) => {
      if (containerWidth === 0 || !pendingRef.current) return;

      const dx = gestureState.dx;
      const dy = gestureState.dy;
      const horizontalThreshold = Math.max(60, containerWidth * 0.12);
      const verticalThreshold = 80;

      const isNext = dx < -horizontalThreshold;
      const isPrev = dx > horizontalThreshold;
      const isSwipeDown = dy > verticalThreshold;

      if (isSwipeDown) {
        onClose();
        return;
      }

      if (isNext) {
        moveToIndex(focusIndex + 1);
      } else if (isPrev) {
        moveToIndex(focusIndex - 1);
      } else {
        pendingRef.current = false;
        Animated.timing(bannerAnim, {
          toValue: -focusIndex * containerWidth,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          pendingRef.current = true;
        });
      }
    },
  });

  const watermarkText = `${profileDetails?.name}${profileDetails?.universityDetails.name}${my?.phoneNumber}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.container}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width || screenW;
          if (w !== containerWidth) {
            setContainerWidth(w);
          }
        }}
      >
        <View style={styles.back} />
        <Text style={styles.count}>
          {focusIndex} / {images.length}
        </Text>
        <Pressable onPress={onClose} style={styles.close}>
          <XIcon width={20} height={20} stroke="#fff" />
        </Pressable>

        <View
          style={{
            width: containerWidth || screenW,
            overflow: "hidden",
            alignSelf: "center",
          }}
        >
          <Animated.View
            {...(!isSingle ? panResponder.panHandlers : {})}
            style={[
              styles.row,
              {
                width: (containerWidth || screenW) * array.length,
                transform: [{ translateX: bannerAnim }],
              },
            ]}
          >
            {array.map((imageUrl, idx) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={idx}
                style={{
                  width: containerWidth || screenW,
                  height: screenH,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={[
                    styles.image,
                    { width: containerWidth || screenW, height: screenH },
                  ]}
                />

                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      zIndex: 30,
                      opacity: 0.15,
                    },
                  ]}
                >
                  {Array.from({ length: 3 }, (_, rowIndex) => (
                    <View
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={rowIndex}
                      style={{
                        position: "absolute",
                        top: rowIndex * 200 + 200,
                        left: 0,
                        right: 0,
                        transform: [{ rotate: "-45deg" }],
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: semanticColors.text.inverse,
                        }}
                      >
                        {watermarkText}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  row: {
    flexDirection: "row",
    height: screenH,
    position: "relative",
  },
  image: {
    resizeMode: "contain",
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: semanticColors.surface.inverse,
    zIndex: 0,
  },
  close: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 16,
    left: 16,
    zIndex: 20,
    padding: 10,
  },
  count: {
    color: semanticColors.text.inverse,
    fontSize: 16,
    top: Platform.OS === "ios" ? 50 : 16,
    position: "absolute",
    lineHeight: 40,
    textAlign: "center",
    width: "100%",
  },
});
