import React from "react";
import { View, StyleSheet, Dimensions, Pressable, Text as RNText } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MomentNavigationProps, MomentNavigationItem, MomentNavigationHeight } from "../types";
import colors from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui/text";
import { useRouletteEligibility } from "@/src/features/event/hooks/roulette/use-roulette-eligibility";

const { width: screenWidth } = Dimensions.get("window");

const HEIGHT_CONFIG = {
  lg: 151,
  md: 120,
} as const;

export const MomentNavigationMenu = ({ items, itemHeight, itemsPerRow }: MomentNavigationProps) => {
  const actualHeight = HEIGHT_CONFIG[itemHeight];
  const { data: rouletteEligibility } = useRouletteEligibility();

  const rows = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  const handlePress = (item: MomentNavigationItem) => {
    if (item.id === "moment-daily-roulette") {
      router.push("/moment/daily-roulette");
    } else {
      item.onPress?.();
    }
  };

  const getItemDisabledState = (item: MomentNavigationItem) => {
    if (item.id === "moment-daily-roulette" && rouletteEligibility && !rouletteEligibility.canParticipate) {
      return {
        isDisabled: true,
        text: item.disabledText || "참여 완료!",
        message: item.disabledMessage || "오늘은 이미 참여했어요!",
      };
    }
    if (item.isReady === false) {
      return {
        isDisabled: true,
        text: item.disabledText || "준비 중..",
        message: item.disabledMessage,
      };
    }
    return { isDisabled: false, text: null, message: null };
  };

  const renderItem = (item: MomentNavigationItem, itemIndex: number, totalInRow: number) => {
    const isLastInRow = itemIndex === totalInRow - 1;
    const imageSize = item.imageSize || 60;
    const disabledState = getItemDisabledState(item);

    return (
      <Pressable
        key={item.id}
        style={[
          styles.menuItem,
          {
            flex: 1,
            height: actualHeight,
            marginRight: isLastInRow ? 0 : 7,
          },
        ]}
        onPress={!disabledState.isDisabled ? () => handlePress(item) : undefined}
        disabled={disabledState.isDisabled}
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

        {disabledState.isDisabled && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text textColor="white" weight="semibold" size="md">
                {disabledState.text}
              </Text>
              {disabledState.message && (
                <Text textColor="white" size="10" style={styles.disabledMessage}>
                  {disabledState.message}
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
    gap: 4,
  },
  disabledMessage: {
    textAlign: "center",
    paddingHorizontal: 8,
  },
});