import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <View className="flex-1">
      <Stack>
      <Stack.Screen 
          name="(signup)" 
          options={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'fade',
          }} 
        />
      </Stack>
    </View>
  );
} 