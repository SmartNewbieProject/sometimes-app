import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

export default function PartnerLayoutScreen() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="view"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: semanticColors.surface.background,
            },
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="ban-report"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: semanticColors.surface.background,
            },
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
});
