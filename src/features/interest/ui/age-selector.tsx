import { cn } from "@/src/shared/libs";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import type { AgeOptionData } from "../types";

interface AgeSelectorProps {
  value?: string;
  options: AgeOptionData[];
  onChange: (value: string) => void;
}

export function AgeSelector({ value, onChange, options }: AgeSelectorProps) {
  const renderItem = ({ item }: { item: AgeOptionData }) => (
    <AgeCard
      option={item}
      isSelected={value === item.value}
      onSelect={() => onChange(item.value)}
    />
  );

  return (
    <FlatList
      data={options}
      renderItem={renderItem}
      keyExtractor={(item) => item.value}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
    />
  );
}

interface AgeCardProps {
  option: AgeOptionData;
  isSelected: boolean;
  onSelect: () => void;
}

function AgeCard({ option, isSelected, onSelect }: AgeCardProps) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      activeOpacity={0.8}
    >
      <View
        style={styles.cardInner}
        className={cn(
          "flex-1 font-extralight",
          Platform.OS === "web" && "max-w-[468px]  w-full self-center"
        )}
      >
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

const screenWidth = Dimensions.get("window").width;
const cardSize = (Platform.OS === "web" ? 440 : screenWidth) / 2 - 54; // 2열 그리드

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 0,
    gap: 29,
  },
  row: {
    justifyContent: "space-between",
    gap: 29,
  },
  card: {
    width: cardSize,
    height: cardSize,
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: semanticColors.brand.secondary,
  },
  cardUnselected: {
    borderColor: semanticColors.border.default,
  },
  cardInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 81,
    height: 81,
    aspectRatio: 1,
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