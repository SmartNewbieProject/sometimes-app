import { Text } from "@/src/shared/ui";
import { semanticColors } from '../../../shared/constants/colors';
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface MenuProps {
  options: {
    onClick: () => void;
    text: string;
  }[];
  title: string;
}

function Menu({ options, title }: MenuProps) {
  return (
    <View style={{ backgroundColor: semanticColors.surface.background }}>
      <View style={styles.titleWrapper}>
        <Text textColor={"black"} weight={"bold"} size="md">
          {title}
        </Text>
      </View>
      {options.map((item) => (
        <Pressable key={item.text} onPress={item.onClick} style={styles.menu}>
          <Text textColor={"black"} size="md">
            {item.text}
          </Text>
          <View style={styles.arrowContainer}>
            <View style={styles.arrow} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  titleWrapper: {
    marginVertical: 24,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "space-between",
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

export default Menu;
