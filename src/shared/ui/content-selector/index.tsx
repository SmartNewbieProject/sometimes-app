import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "../text";

export type ContentSelectorSize = "sm" | "md" | "lg";

export interface ContentSelectorProps {
  value?: string;
  size?: ContentSelectorSize;
  style?: StyleProp<ViewStyle>;
  renderContent?: (value: string | null) => ReactNode;
  renderPlaceholder?: () => ReactNode;
  actionLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function ContentSelector({
  value,
  size = "md",
  style,
  renderContent,
  renderPlaceholder,
  actionLabel = undefined,
  activeColor = "#7A4AE2",
  inactiveColor = "#E2D5FF",
}: ContentSelectorProps) {
  const sizeStyle = sizeStyles[size];

  return (
    <View>
      <View
        style={[
          styles.container,
          sizeStyle,
          { borderColor: value ? activeColor : inactiveColor },
          style,
        ]}
      >
        {!!actionLabel && (
          <View
            style={[
              styles.actionLabelContainer,
              { backgroundColor: value ? activeColor : inactiveColor },
            ]}
          >
            <Text size="sm" textColor="white">
              {actionLabel}
            </Text>
          </View>
        )}

        {value && renderContent ? renderContent(value) : null}

        {!value && renderPlaceholder ? (
          renderPlaceholder()
        ) : !value ? (
          <View style={styles.placeholderWrapper}>
            <View style={styles.placeholderContent}>
              <Text size="sm" textColor="disabled">
                콘텐츠 추가하기
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  actionLabelContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  placeholderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderContent: {
    width: "100%",
    height: "100%",
    backgroundColor: semanticColors.surface.background,
    justifyContent: "center",
    alignItems: "center",
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    width: "100%",
    aspectRatio: 1,
  },
  md: {
    width: 160,
    height: 160,
  },
  lg: {
    width: "100%",
    aspectRatio: 1,
  },
});
