import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";
import colors from "@/src/shared/constants/colors";

interface IconProps extends SvgProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
}

export const IconWrapper: React.FC<IconProps> = ({
  style,
  width,
  height,
  size = 24,
  color = colors.darkPurple,
  children,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {React.cloneElement(children as React.ReactElement, {
        width: width || size,
        height: height || size,
        color,
        ...props,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
