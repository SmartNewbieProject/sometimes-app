import React, { useState, useRef, useEffect } from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { useKpiAnalytics } from "@/src/shared/hooks";
import { View, StyleSheet, Dimensions, Animated, PanResponder, Pressable, Text, Linking } from "react-native";
import { Image } from "expo-image";
import { MomentSlide, MomentSlidesProps } from "../types";
import { ImageSourceFactory } from "../strategies/image-source";

const { width: screenWidth } = Dimensions.get("window");

export const MomentSlides = ({ items, autoPlayInterval = 5000, height }: MomentSlidesProps) => {
  const { momentEvents } = useKpiAnalytics();
  const realItems = Array.isArray(items) ? items : [items];
  const isSingle = realItems.length <= 1;

  const array = isSingle
    ? [...realItems]
    : [realItems[realItems.length - 1], ...realItems, realItems[0]];

  const calcInitialFocus = (idx: number) =>
    isSingle ? 0 : Math.min(Math.max(idx, 0), realItems.length - 1) + 1;

  const [focusIndex, setFocusIndex] = useState<number>(calcInitialFocus(0));
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const pendingRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (containerWidth > 0) {
      bannerAnim.setValue(-focusIndex * containerWidth);
      pendingRef.current = true;
    }
  }, [containerWidth]);

  useEffect(() => {
    if (!autoPlayInterval || isSingle || containerWidth === 0) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }

    intervalRef.current = setInterval(() => {
      if (pendingRef.current) {
        moveToIndex(focusIndex + 1);
      }
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
        intervalRef.current = null;
      }
    };
  }, [focusIndex, autoPlayInterval, isSingle, containerWidth]);

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
      const horizontalThreshold = Math.max(60, containerWidth * 0.12);

      const isNext = dx < -horizontalThreshold;
      const isPrev = dx > horizontalThreshold;

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

  const handleItemPress = (item: MomentSlide) => {
    // KPI 이벤트: 모먼트 질문 조회 (슬라이드 클릭시)
    momentEvents.trackQuestionViewed(item.id || 'unknown', item.category || 'general');

    if (item.externalLink) {
      Linking.openURL(item.externalLink).catch((err) => {
        console.error('Failed to open URL:', err);
        // Fallback: 웹 브라우저에서 열기 시도
        window.open(item.externalLink, '_blank');
      });
    } else if (item.link) {
      // 내부 라우팅
      // router.push(item.link);
    }
  };

  const getImageSource = (item: MomentSlide) => {
    try {
      const imageStrategy = ImageSourceFactory.createImageSource(item.imageUrl);
      if (imageStrategy.validateSource()) {
        const imageSource = imageStrategy.loadImage();
        return typeof imageSource === 'string' ? { uri: imageSource } : imageSource;
      }
      return require("@/assets/images/moment/introduction-sometimes.png");
    } catch (error) {
      console.warn('Invalid image source for item:', item.id);
      return require("@/assets/images/moment/introduction-sometimes.png");
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const displayIndex = isSingle ? 0 : Math.max(0, Math.min(focusIndex - 1, realItems.length - 1));

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          overflow: "hidden",
        }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width || screenWidth;
          if (w !== containerWidth) {
            setContainerWidth(w);
          }
        }}
      >
        <Animated.View
          {...(!isSingle ? panResponder.panHandlers : {})}
          style={[
            styles.row,
            {
              width: (containerWidth || screenWidth) * array.length,
              transform: [{ translateX: bannerAnim }],
            },
          ]}
        >
          {array.map((item, idx) => (
            <View
              key={idx}
              style={{
                width: containerWidth || screenWidth,
                height,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                style={{ width: '100%', height: '100%' }}
                onPress={() => handleItemPress(item)}
              >
                <Image
                  source={getImageSource(item)}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  onError={(error) => {
                    console.log('Image load error:', error);
                  }}
                />
              </Pressable>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {displayIndex + 1}/{realItems.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    position: "relative",
  },
  pageIndicator: {
    position: "absolute",
    top: 16,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageText: {
    color: semanticColors.text.inverse,
    fontSize: 12,
    fontWeight: "500",
  },
});