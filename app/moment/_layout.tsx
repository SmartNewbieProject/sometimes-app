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
    </Stack>
  );
}