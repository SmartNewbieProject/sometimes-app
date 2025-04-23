import { initializeIMP } from '@/src/features/payment/web';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function PurchaseLayout() {

  useEffect(() => {
    initializeIMP(process.env.EXPO_PUBLIC_IMP as string);
  }, []);

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
