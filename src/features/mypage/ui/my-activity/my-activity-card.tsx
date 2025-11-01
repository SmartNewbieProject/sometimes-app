import { useAppFont } from "@/src/shared/hooks/use-app-font";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MyActivityCardProps {
  title: string;
  onPress: () => void;
}

function MyActivityCard({ title, onPress }: MyActivityCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.arrowContainer}>
        <View style={styles.arrow} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontFamily: useAppFont("regular"),
    fontWeight: 400,
    lineHeight: 21,
    letterSpacing: -0.045,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    position: "relative",
  },
  arrow: {
    width: 8,
    height: 8,
    top: 6,
    left: 6,
    position: "absolute",
    borderRightWidth: 2,
    borderRightColor: "#BAC1CB",
    borderBottomWidth: 2,
    borderBottomColor: "#BAC1CB",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
});

export default MyActivityCard;
