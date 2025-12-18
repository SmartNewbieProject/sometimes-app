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
    <View style={styles.container}>
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
              style={styles.titleText}
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
  container: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
