import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { ProgressBar } from '@/src/shared/ui/progress-bar';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import Signup from '@features/signup';
import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const { useSignupProgress, SignupSteps } = Signup;

export default function SignupLayout() {
  const { progress, updateStep } = useSignupProgress();

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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="account" 
          options={{ 
            headerShown: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
