import React from "react";
import { View, StyleSheet, Dimensions, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { NavigationMenuProps, NavigationMenuItem } from "../../types";
import colors from "@/src/shared/constants/colors";

const { width: screenWidth } = Dimensions.get("window");

export const NavigationMenu = ({ items, itemHeight, itemsPerRow }: NavigationMenuProps) => {
  const containerWidth = screenWidth - 40; // 20px 양쪽 패딩 제외
  const itemWidth = (containerWidth - (itemsPerRow - 1) * 16) / itemsPerRow; // 아이템 간 간격 고려

  // 아이템들을 행별로 그룹화
  const rows = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  const renderItem = (item: NavigationMenuItem, itemIndex: number, totalInRow: number) => {
    const isLastInRow = itemIndex === totalInRow - 1;

    return (
      <Pressable
        style={[
          styles.menuItem,
          {
            width: item.width || itemWidth,
            height: itemHeight,
            marginRight: isLastInRow ? 0 : 16,
          },
        ]}
        onPress={item.onPress}
      >
        {/* 배경 이미지 */}
        {item.backgroundImageUrl && (
          <Image
            source={typeof item.backgroundImageUrl === 'string' ? { uri: item.backgroundImageUrl } : item.backgroundImageUrl}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        )}

        {/* 컨텐츠 */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, itemIndex) => renderItem(item, itemIndex, row.length))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    maxWidth: screenWidth,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 16,
    width: screenWidth - 40,
    maxWidth: screenWidth - 40,
  },
  menuItem: {
    backgroundColor: "#F9F7FF",
    borderWidth: 1,
    borderColor: "#E2D6FF",
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backgroundImage: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 60,
    height: 60,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 8,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
});