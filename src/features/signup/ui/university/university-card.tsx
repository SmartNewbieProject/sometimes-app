import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { UniversityCard as UniversityCardProps } from "../../queries/use-universities";


function UniversityCard({
  item: { name, area, logoUrl, en },
  onClick,
  isSelected,
}: {
  item: UniversityCardProps;
  onClick: () => void;
  isSelected: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgColor = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(bgColor, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(bgColor, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const interpolatedBg = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#E6DBFF"],
  });

  return (
    <Pressable testID={`university-card-${name}`} onPress={onClick} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? "#E6DBFF" : interpolatedBg,
            transform: [{ scale }],
          },
        ]}
      >
        <Image source={logoUrl} style={{ width: 65, height: 65 }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
            {name}
          </Text>
          <Text style={styles.englishName}>{en}</Text>
          <View style={styles.bottomContainer}>
            <View style={styles.area}>
              <Text style={styles.areaText}>{area}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 36,
    borderWidth: 1.5,
    borderColor: semanticColors.border.default,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    color: semanticColors.text.primary,
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 24,
  },
  area: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    gap: 6,
  },
  areaText: {
    color: semanticColors.text.inverse,
    fontSize: 13,
    lineHeight: 13,
    fontFamily: "Pretendard-Medium",
    fontWeight: "500",
  },
  universityType: {
    color: semanticColors.text.disabled,
    fontFamily: "Pretendard-Regular",
    lineHeight: 22,
    fontWeight: "400",
    fontSize: 13,
  },
  englishName: {
    color: semanticColors.text.primary,
    marginVertical: 8,
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "Pretendard-Regular",
    fontWeight: "400",
  },
});

export default UniversityCard;
