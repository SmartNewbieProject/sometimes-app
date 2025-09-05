import { Stack } from "expo-router";
import { View } from "react-native";
import { PalePurpleGradient } from "@/src/shared/ui";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";

export default function UniversityVerificationLayout() {
  return (
    <OverlayProvider>
      <View className="flex-1">
        <PalePurpleGradient />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="success"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="idcard"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
        </Stack>
      </View>
    </OverlayProvider>
  );
}
