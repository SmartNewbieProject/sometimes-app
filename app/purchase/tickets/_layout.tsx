import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function PurchaseLayout() {
  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen 
          name="rematch" 
          options={{
            headerTitle: '매칭권',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontWeight: 600,
            },
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
