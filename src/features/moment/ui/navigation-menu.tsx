import React from "react";
import { View, StyleSheet, Dimensions, Pressable, Text as RNText } from "react-native";
import { Image } from "expo-image";
import { MomentNavigationProps, MomentNavigationItem, MomentNavigationHeight } from "../types";
import colors from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui/text";
import { useModal } from "@/src/shared/hooks/use-modal";
import RouletteModal from "@/src/features/event/ui/roulette/roulette-modal";

const { width: screenWidth } = Dimensions.get("window");

const HEIGHT_CONFIG = {
  lg: 151,
  md: 120,
} as const;

export const MomentNavigationMenu = ({ items, itemHeight, itemsPerRow }: MomentNavigationProps) => {
  const { showModal } = useModal();
  const actualHeight = HEIGHT_CONFIG[itemHeight];

  const rows = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  const handlePress = (item: MomentNavigationItem) => {
    if (item.id === "moment-daily-roulette") {
      showModal({
        title: "",
        children: <RouletteModal />,
        hideTitleBar: true,
        hidePrimaryButton: true,
        hideSecondaryButton: true,
      });
    } else {
      item.onPress?.();
    }
  };

  const renderItem = (item: MomentNavigationItem, itemIndex: number, totalInRow: number) => {
    const isLastInRow = itemIndex === totalInRow - 1;
    const imageSize = item.imageSize || 60;
    const isReady = item.isReady !== false; // Default to true if not specified

    return (
      <Pressable
        style={[
          styles.menuItem,
          {
            flex: 1,
            height: actualHeight,
            marginRight: isLastInRow ? 0 : 7,
          },
        ]}
        onPress={isReady ? () => handlePress(item) : undefined}
        disabled={!isReady}
      >
        {item.backgroundImageUrl && (
          <Image
            source={typeof item.backgroundImageUrl === 'string' ? { uri: item.backgroundImageUrl } : item.backgroundImageUrl}
            style={[
              styles.backgroundImage,
              {
                width: imageSize,
                height: imageSize,
              },
            ]}
            contentFit="cover"
          />
        )}

        <View style={styles.content}>
          {item.titleComponent}
          <RNText style={styles.description}>{item.description}</RNText>
        </View>

        {!isReady && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text textColor="white" weight="semibold" size="md">
                준비 중..
              </Text>
              {item.readyMessage && (
                <Text textColor="white" size="10" style={styles.readyMessage}>
                  {item.readyMessage}
                </Text>
              )}
            </View>
          </View>
        )}
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
    width: "100%",
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 9,
    width: "100%",
  },
  menuItem: {
    backgroundColor: "#F9F7FF",
    borderWidth: 1,
    borderColor: "#E2D6FF",
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    elevation: 5,
  },
  backgroundImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  description: {
    fontSize: 10,
    color: colors.strong,
    lineHeight: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  overlayContent: {
    alignItems: "center",
    gap: 8,
  },
  readyMessage: {
    textAlign: "center",
    marginTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
  },
});