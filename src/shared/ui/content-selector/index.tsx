import { type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../text";
import { semanticColors } from "../../constants/colors";

export interface ContentSelectorProps {
  value?: string;
  size?: 'sm' | 'md' | 'lg';
  renderContent?: (value: string | null) => ReactNode;
  renderPlaceholder?: () => ReactNode;
  actionLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function ContentSelector({
  value,
  size = 'md',
  renderContent,
  renderPlaceholder,
  actionLabel,
  activeColor = "#7A4AE2",
  inactiveColor = "#E2D5FF",
}: ContentSelectorProps) {
  const selectorStyles = createSelectorStyles({ size });

  return (
    <View>
      <View
        style={[
          selectorStyles.container,
          {
            borderColor: value ? activeColor : inactiveColor,
          }
        ]}
      >
        {actionLabel && (
          <View
            style={[
              selectorStyles.actionLabel,
              {
                backgroundColor: value ? activeColor : inactiveColor,
              }
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
        ) : (
          <View style={styles.defaultPlaceholder}>
            <View style={styles.placeholderContent}>
              <Text size="sm" textColor="disabled">
                콘텐츠 추가하기
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const createSelectorStyles = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeStyles = {
    sm: { width: 105, height: 105 },
    md: { width: 160, height: 160 },
    lg: { width: 220, height: 220 },
  };

  return {
    container: {
      borderRadius: 20,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 1,
      ...sizeStyles[size],
    },
    actionLabel: {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderBottomLeftRadius: 8,
    },
  };
};

const styles = StyleSheet.create({
  defaultPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContent: {
    width: '100%',
    height: '100%',
    backgroundColor: semanticColors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
