import { type StyleProp, View, type ViewStyle, StyleSheet } from "react-native";

type DividerProps = {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const Horizontal = ({
  color = "#E7E9EC",
  size = 1,
  style,
}: DividerProps) => {
  return (
    <View
      style={[
        styles.horizontal,
        {
          height: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const Vertical = ({
  color = "#E7E9EC",
  size = 1,
  style,
}: DividerProps) => {
  return (
    <View
      style={[
        styles.vertical,
        {
          width: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export const Divider = {
  Horizontal,
  Vertical,
};

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
});
