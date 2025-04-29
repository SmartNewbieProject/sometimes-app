import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function PartnerLayoutScreen() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="view"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}
