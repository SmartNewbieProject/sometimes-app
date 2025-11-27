import { semanticColors } from "@/src/shared/constants/colors";
import { Stack } from "expo-router";

export default function MomentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Moment",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="my-moment"
        options={{
          title: "나의 모먼트",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="weekly-report"
        options={{
          title: "모먼트 보고서",
          headerShown: true,
          headerStyle: {
            backgroundColor: 'white',
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: semanticColors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
          },
        }}
      />
    </Stack>
  );
}