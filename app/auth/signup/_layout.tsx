import Loading from '@features/loading';
import { cn } from '@shared/libs/cn';
import { platform } from '@shared/libs/platform';
import { PalePurpleGradient } from '@shared/ui/gradient';
import { ProgressBar } from '@shared/ui/progress-bar';
import Signup from '@features/signup';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
import { Suspense, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { BackHandler } from 'react-native';

const { useSignupProgress, SignupSteps } = Signup;

export default function SignupLayout() {
  const { progress, updateStep } = useSignupProgress();
  const pathname = usePathname();
  const renderProgress = pathname !== '/auth/signup/done';

  const handleBackPress = useCallback(() => {
    updateStep(SignupSteps.TERMS);
    return true;
  }, [updateStep]);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [handleBackPress])
  );

  return (
    <View className="flex-1">
      <PalePurpleGradient />
      {renderProgress && (
      <View className={cn(
        "px-5 pb-[30px] items-center bg-white",
        platform({
          ios: () => "pt-[80px]",
          android: () => "pt-[80px]",
          web: () => "pt-[14px] !pb-[8px]",
        })
      )}>
        <ProgressBar progress={progress} />
      </View>
      )}
      <Suspense fallback={<Loading.Page />}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen 
          name="account" 
          options={{ 
            headerShown: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="profile-image" options={{ headerShown: false }} />
        <Stack.Screen name="university" options={{ headerShown: false }} />
        <Stack.Screen name="university-details" options={{ headerShown: false }} />
        <Stack.Screen name="done" options={{ headerShown: false }} />
      </Stack>
      </Suspense>
    </View>
  );
}
