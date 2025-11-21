import { Image } from "expo-image";
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
  item: { name, region, universityType, area, logoUrl, en },
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
    <Pressable onPress={onClick} onPressIn={onPressIn} onPressOut={onPressOut}>
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
          <Text style={styles.englishName}>
            {en}
          </Text>
          <View style={styles.bottomContainer}>
            <View style={styles.area}>
              <Text style={styles.areaText}>{area}</Text>
            </View>

            <Text style={styles.universityType}>{universityType}</Text>
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
    borderColor: "#E6DBFF",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    color: "#000",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "semibold",
    lineHeight: 24,
  },
  area: {
    paddingHorizontal: 11,
    backgroundColor: "#7A4AE2",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    gap: 6,
  },
  areaText: {
    color: "#fff",
    fontSize: 10,
    lineHeight: 12,
  },
  universityType: {
    color: "#9B94AB",
    fontFamily: "thin",
    lineHeight: 22,
    fontWeight: 100,
    fontSize: 13,
  },
  englishName: {
    color: "#000",
    marginVertical: 8,
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 16,
  },
});

export default UniversityCard;
