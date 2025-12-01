import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MyMomentPage } from "@/src/features/moment/ui/my-moment";
import { BottomNavigation } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";

export default function MyMomentRoute() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "모먼트 질문함",
          headerTitleAlign: "center", // Center the title
          headerBackTitleVisible: false,
          headerTintColor: semanticColors.text.primary,
          headerStyle: {
            backgroundColor: colors.momentBackground, // Match header bg to page bg if desired, or keep white
          },
          headerShadowVisible: false,
          headerLeft: () => null, // Remove default back button
        }}
      />
      <MyMomentPage
        onBackPress={() => router.push('/moment')}
      />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.momentBackground,
  },
});
