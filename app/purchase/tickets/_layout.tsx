import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function PurchaseLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen 
          name="rematch" 
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'slide_from_right'
          }} 
        />
      </Stack>
    </View>
  );
}
