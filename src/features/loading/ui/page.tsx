import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@/src/shared/ui/text";
import { ReactNode } from "react";

// Direct imports to avoid circular dependencies
import { Lottie } from "@/src/shared/ui/lottie";

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
      {!!children && children}
      {!children && (
        <View style={styles.loadingContainer}>
          <Lottie size={size} />
          {title && (
            <Text
              variant="primary"
              weight="normal"
              textColor="black"
              size="md"
              style={styles.title}
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
    backgroundColor: '#faf5ff', // purple-50
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: 'center',
    marginTop: 8,
  },
});
