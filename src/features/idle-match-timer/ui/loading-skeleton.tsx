import { ActivityIndicator, StyleSheet, View } from "react-native";
import colors from "@/src/shared/constants/colors";
import { PurpleGradient } from "@/src/shared/ui";

export const LoadingSkeleton = () => {
  return (
    <View style={styles.container}>
      <PurpleGradient />
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primaryPurple} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  card: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
