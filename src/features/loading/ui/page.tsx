import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Lottie, PalePurpleGradient, Text } from "@shared/ui";
import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
  size?: number;
  spinnerSize?: "small" | "large";
  spinnerColor?: string;
};

export default function PageLoading({
  title,
  children,
  size = 96,
  spinnerSize = "large",
  spinnerColor = "#8C6AE3",
}: Props) {
  return (
    <View className="flex-1 flex flex-col h-screen items-center justify-center">
      <PalePurpleGradient />
      <Lottie size={size} />
      {!!children && children}
      {!children && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={spinnerSize} color={spinnerColor} />
          {title && (
            <Text
              variant="primary"
              weight="normal"
              textColor="black"
              size="md"
              className="text-center mt-2"
            >
              {title}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
