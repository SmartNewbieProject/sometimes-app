import React from "react";
import { semanticColors } from '../../../../shared/constants/colors';
import { StyleSheet, Text, View } from "react-native";
import CustomSwitch from "../custom-switch";


interface MatchingCardProps {
  title: string;
  isOn: boolean;
  toggle: () => void;
  disabled?: boolean;
}

function MatchingCard({ title, isOn, toggle, disabled }: MatchingCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <CustomSwitch disabled={disabled} value={isOn} onChange={toggle} />
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
    color: semanticColors.text.primary,
    fontSize: 16,

    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 18,
  },
});

export default MatchingCard;
