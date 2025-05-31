import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function CommunityLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="write"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="update/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="report"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
