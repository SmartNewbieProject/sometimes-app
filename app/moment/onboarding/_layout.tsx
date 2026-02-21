import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
