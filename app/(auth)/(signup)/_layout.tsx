import { useSignupProgress } from '@/src/features/signup/hooks';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { ProgressBar } from '@/src/shared/ui/progress-bar';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SignupLayout() {
  const { progress } = useSignupProgress();
  
  return (
    <View className="flex-1">
        <PalePurpleGradient />
        <View className={cn(
          "px-5 pb-[30px] items-center",
          platform({
            ios: () => "pt-[80px]",
            android: () => "pt-[80px]",
            web: () => "pt-[30px]",
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
        <Stack.Screen name="email" options={{ headerShown: false }} />
        <Stack.Screen name="password" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
