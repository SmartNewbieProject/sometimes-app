import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { MyMomentPage } from "@/src/features/moment/ui/my-moment";
import { BottomNavigation } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/moment')}
              style={{ marginLeft: 16 }}
            >
              <ChevronLeft size={24} color={semanticColors.text.primary} />
            </TouchableOpacity>
          ),
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
