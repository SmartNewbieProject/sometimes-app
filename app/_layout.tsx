import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { QueryProvider, RouteTracker } from '@/src/shared/config';
import { useColorScheme } from '@/src/shared/hooks/use-color-schema';
import { cn } from '@/src/shared/libs/cn';
import { ModalProvider, AnalyticsProvider } from '@/src/shared/providers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAtt } from '@/src/shared/hooks';
import { PortoneProvider } from '@/src/features/payment/hooks/PortoneProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { request: requestAtt } = useAtt();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.ttf'),
    'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-Black': require('../assets/fonts/Pretendard-Black.ttf'),
    'Rubik': require('../assets/fonts/Rubik-Regular.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
    'Rubik-Light': require('../assets/fonts/Rubik-Light.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    requestAtt();
  }, []);

  useEffect(() => {
    // Hotjar는 웹에서만 초기화 (Android 빌드 문제 방지)
    if (Platform.OS === 'web') {
      try {
        const script = document.createElement('script');
        script.innerHTML = `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:6430952,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `;
        document.head.appendChild(script);

        if (__DEV__) {
          console.log("Hotjar script loaded in development mode.");
        }
      } catch (error) {
        console.warn("Failed to load Hotjar:", error);
      }
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ModalProvider>
          <PortoneProvider>
            <View
              className={cn(
                'flex-1 font-extralight',
                Platform.OS === 'web' && 'max-w-[468px] w-full self-center'
              )}
            >
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <AnalyticsProvider>
                    <RouteTracker>
                      <Slot />
                    </RouteTracker>
                  </AnalyticsProvider>
                </ThemeProvider>
            </View>
          </PortoneProvider>
        </ModalProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
