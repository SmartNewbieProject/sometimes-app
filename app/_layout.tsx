import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import Hotjar from '@hotjar/browser';

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
    // Hotjar Site ID와 Version
    const siteId = 6430952;
    const hotjarVersion = 6;

    // Hotjar 초기화 (웹 플랫폼에서만)
    if (Platform.OS === 'web') {
      Hotjar.init(siteId, hotjarVersion);

      // 개발 환경에서 디버그 로그
      if (__DEV__) {
        console.log("Hotjar initialized in development mode.");
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
