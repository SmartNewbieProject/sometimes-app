import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomSwitch from "../custom-switch";

interface MatchingCardProps {
  title: string;
  isOn: boolean;
  toggle: () => void;
}

function MatchingCard({ title, isOn, toggle }: MatchingCardProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      <CustomSwitch disabled value={isOn} onChange={toggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: "#4C4854",
    fontSize: 16,

    fontWeight: 500,
    lineHeight: 18,
  },
});

export default MatchingCard;
