import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import type React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle, type TextStyle } from "react-native";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  showDivider?: boolean;
  titleRight?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  dividerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function FormSection({
  title,
  children,
  showDivider = true,
  titleRight,
  containerStyle,
  titleStyle,
  titleContainerStyle,
  dividerStyle,
  contentStyle,
}: FormSectionProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {titleRight ? (
        <View style={[styles.titleContainer, titleContainerStyle]}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {titleRight}
        </View>
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
      {showDivider && <View style={[styles.divider, dividerStyle]} />}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 22,
  },
  divider: {
    marginTop: 6,
    marginBottom: 10,
    height: 0.5,
    backgroundColor: semanticColors.surface.other,
  },
});
