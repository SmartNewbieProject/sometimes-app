import React from "react";
import {
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from "react-native";

interface TooltipProps {
  title: string;
  description?: string[];
  textStyle?: StyleProp<TextStyle>;
}

function Tooltip({ title, description, textStyle = {} }: TooltipProps) {
  return (
    <View>
      <View style={{ marginBottom: 8 }}>
        <Text style={[styles.title, textStyle]}>{title}</Text>
      </View>
      {description?.map((item) => (
        <View key={item} style={styles.descriptionContainer}>
          <View style={styles.dot} />
          <Text key={item} style={[styles.description, textStyle]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,

    fontFamily: "regular",
    fontWeight: 400,

    color: "#777777",
  },
  description: {
    fontSize: 14,
    fontFamily:  "regular",
    fontWeight: 400,

    color: "#919191",
  },
  descriptionContainer: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 10,
    alignItems: "center",
    marginBottom: 1,
  },
  dot: {
    paddingTop: 0.5,
    width: 3.5,
    height: 3.5,
    backgroundColor: "#919191",
    borderRadius: "50%",
  },
});

export default Tooltip;
