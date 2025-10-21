import React from "react";
import { type ViewStyle, type DimensionValue } from "react-native";
import { Shimmer } from "./shimmer";

type SkeletonBlockProps = {
  w?: DimensionValue;
  h?: DimensionValue;
  r?: number;
  style?: ViewStyle;
  reduceMotion?: boolean;
};

export function SkeletonBlock({
  w = "100%",
  h = 12,
  r = 6,
  style,
  reduceMotion,
}: SkeletonBlockProps) {
  return (
    <Shimmer
      width={w}
      height={h}
      borderRadius={r}
      style={style}
      reduceMotion={reduceMotion}
    />
  );
}
