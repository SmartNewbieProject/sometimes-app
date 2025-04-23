import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function EventLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="pre-signup"
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
