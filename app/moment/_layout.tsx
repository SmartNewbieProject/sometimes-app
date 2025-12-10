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
          headerShown: false,
          headerTitle: "모먼트 보고서",
        }}
      />
      <Stack.Screen
        name="daily-roulette"
        options={{
          headerShown: false,
          title: "데일리 룰렛",
        }}
      />
    </Stack>
  );
}