import { cn } from "@/src/shared/libs/cn";
import { type StyleProp, View, type ViewStyle } from "react-native";

type DividerProps = {
  color?: string;
  size?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const Horizontal = ({
  color = "#E7E9EC",
  size = 1,
  className = "",
}: DividerProps) => {
  return (
    <View
      className={cn("w-full", className)}
      style={{
        height: size,
        backgroundColor: color,
      }}
    />
  );
};

const Vertical = ({
  color = "#E7E9EC",
  size = 1,
  className = "",
  style = {},
}: DividerProps) => {
  return (
    <View
      className={cn("h-full", className)}
      style={[
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
