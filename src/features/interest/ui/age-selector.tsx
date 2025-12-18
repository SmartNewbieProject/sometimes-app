import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import type { AgeOptionData } from "../types";

interface AgeSelectorProps {
  value?: string;
  options: AgeOptionData[];
  onChange: (value: string) => void;
}

const CARD_GAP = 8;
const HORIZONTAL_PADDING = 32;

const MAX_CARD_SIZE = 180;

export function AgeSelector({ value, onChange, options }: AgeSelectorProps) {
  const { width: screenWidth } = useWindowDimensions();
  const calculatedSize = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
  const cardSize = Math.min(MAX_CARD_SIZE, Math.max(140, calculatedSize));

  console.log("AgeSelector options:", options.length, "screenWidth:", screenWidth, "cardSize:", cardSize);

  if (options.length === 0) {
    return (
      <View style={styles.container}>
        <Text>옵션 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {options.slice(0, 2).map((item) => (
          <AgeCard
            key={item.value}
            option={item}
            isSelected={value === item.value}
            onSelect={() => onChange(item.value)}
            size={cardSize}
          />
        ))}
      </View>
      <View style={styles.row}>
        {options.slice(2, 4).map((item) => (
          <AgeCard
            key={item.value}
            option={item}
            isSelected={value === item.value}
            onSelect={() => onChange(item.value)}
            size={cardSize}
          />
        ))}
      </View>
    </View>
  );
}

interface AgeCardProps {
  option: AgeOptionData;
  isSelected: boolean;
  onSelect: () => void;
  size: number;
}

function AgeCard({ option, isSelected, onSelect, size }: AgeCardProps) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
        { width: size, height: size },
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <Image source={option.image} style={styles.image} resizeMode="cover" />
        <Text variant="primary" size="md" weight="semibold">
          {option.label}
        </Text>

        <View
          style={[
            styles.badge,
            isSelected ? styles.badgePrimary : styles.badgeGray,
          ]}
        >
          <Text size="sm" textColor="white">
            {t("features.interest.ui.age-selector.select")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: semanticColors.surface.background,
  },
  cardSelected: {
    borderColor: semanticColors.brand.secondary,
  },
  cardUnselected: {
    borderColor: "#E9D9FF",
  },
  cardInner: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 81,
    height: 81,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderBottomLeftRadius: 8,
  },
  badgePrimary: {
    backgroundColor: semanticColors.brand.secondary,
  },
  badgeGray: {
    backgroundColor: semanticColors.surface.other,
  },
});
