import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function MyLayout() {
  return (
    <View style={layoutStyles.container}>
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
          name="withdrawal"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="approval-step/approved"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        {/* REMOVED: approval-step/rejected - 사진 거절 페이지가 사진관리 페이지로 통합됨 (2025-12-14) */}
        <Stack.Screen
          name="approval-step/waiting"
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

const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
