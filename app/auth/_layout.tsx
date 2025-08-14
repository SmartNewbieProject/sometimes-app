import { Stack } from "expo-router";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="login/index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="login/redirect"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="approval-pending"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="approval-rejected"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="reapply"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="login/apple-info"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
    </View>
  );
}
