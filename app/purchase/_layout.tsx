import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Payment from '@features/payment';
import { resetIMP } from '@/src/features/payment/web';

export default function PurchaseLayout() {

  useEffect(() => {
    if (Platform.OS === 'web') {
      // 초기 로드 시 IMP 초기화 상태 리셋
      resetIMP();

      if (!document.querySelector('script[src="https://cdn.iamport.kr/v1/iamport.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.iamport.kr/v1/iamport.js';
        script.async = true;
        script.onload = () => {
          if (window.IMP) {
            const merchantID = process.env.EXPO_PUBLIC_IMP || 'imp00000000';
            Payment.web.initializeIMP(merchantID);
            console.log('IMP 객체가 초기화되었습니다.');
          }
        };
        document.head.appendChild(script);
        return () => {
          document.head.removeChild(script);
        };
      } else if (window.IMP && !Payment.web.isIMPLoaded()) {
        const merchantID = process.env.EXPO_PUBLIC_IMP || 'imp00000000';
        Payment.web.initializeIMP(merchantID);
        console.log('IMP 객체가 초기화되었습니다.');
      }
    }
  }, []);

  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="tickets"
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
