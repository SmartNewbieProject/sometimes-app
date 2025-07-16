import { Text } from "@/src/shared/ui";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
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
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
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
            선택
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const screenWidth = Dimensions.get("window").width;
const cardSize = screenWidth / 2 - 54; // 2열 그리드

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
    borderColor: "#9747FF",
  },
  cardUnselected: {
    borderColor: "#E2D5FF",
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
    backgroundColor: "#9747FF",
  },
  badgeGray: {
    backgroundColor: "#E2D5FF",
  },
});
