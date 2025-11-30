import React, { useState, useRef, useEffect } from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { View, StyleSheet, Dimensions, FlatList, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { Linking } from "expo-router";

import { ImageSlideProps, SlideItem } from "../../types";

const { width: screenWidth } = Dimensions.get("window");

export const ImageSlide = ({ items, autoPlayInterval = 5000, width, height }: ImageSlideProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 자동 슬라이드 타이머 설정
    intervalRef.current = setInterval(() => {
      if (items.length > 0) {
        const nextIndex = (currentIndex + 1) % items.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, items.length, autoPlayInterval]);

  const handleScroll = (event: any) => {
    const imageWidth = Math.min(screenWidth, 393);
    const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
    setCurrentIndex(index);
  };

  const handleItemPress = (item: SlideItem) => {
    if (item.externalLink) {
      Linking.openURL(item.externalLink);
    } else if (item.link) {
      // 내부 라우팅
      // router.push(item.link);
    }
  };

  const renderItem = ({ item }: { item: SlideItem }) => {
  const imageWidth = Math.min(screenWidth, 393);

  const getImageSource = () => {
    if (typeof item.imageUrl === 'string') {
      return { uri: item.imageUrl };
    }
    return item.imageUrl;
  };

  return (
    <Pressable
      style={[styles.slideItem, { width: imageWidth }]}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={getImageSource()}
        style={[styles.image, { width: imageWidth, height }]}
        contentFit="cover"
        onError={(error) => {
          console.log('Image load error:', error.nativeEvent.error);
        }}
        placeholder={require("@/assets/images/moment/introduction-sometimes.png")}
      />
    </Pressable>
  );
};

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: Math.min(screenWidth, 393),
          offset: Math.min(screenWidth, 393) * index,
          index,
        })}
      />

      {/* 페이지 표시기 */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {currentIndex + 1}/{items.length}
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
  slideItem: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth,
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