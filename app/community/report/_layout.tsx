import { Stack } from "expo-router";
import { View } from "react-native";

export default function ReportLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>
    </View>
  );
}
