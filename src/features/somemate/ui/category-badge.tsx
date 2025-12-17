import { StyleSheet, Text, View } from "react-native";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { AiChatCategory } from "../types";

interface CategoryBadgeProps {
  category: AiChatCategory;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  return (
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryBadgeText}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryBadge: {
    backgroundColor: semanticColors.surface.other,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: semanticColors.brand.primary,
    fontFamily: "Pretendard-SemiBold",
  },
});

