import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { usePortone } from '@/src/features/payment/hooks';
import { usePortoneScript } from '@/src/features/payment/hooks/PortoneProvider';

export default function PurchaseLayout() {
  const { initialize } = usePortone();
  const { loaded, error } = usePortoneScript();

  useEffect(() => {
    if (!loaded || error) return;
    
    const impKey = process.env.EXPO_PUBLIC_IMP;
    if (!impKey) {
      console.error('포트원 상점 키가 설정되지 않았습니다.');
      return;
    }

    initialize(impKey);
  }, [loaded, error, initialize]);

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
