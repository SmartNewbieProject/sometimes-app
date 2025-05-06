import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import Interest from '@features/interest';
import { cn } from '@/src/shared/libs';
import { platform } from '@/src/shared/libs/platform';
import { ProgressBar } from '@/src/shared/ui';

const { hooks } = Interest;
const { useInterestStep } = hooks;

export default function InterestLayout() {
  const pathname = usePathname();
  const renderProgress = !(['/interest', '/interest/done'].includes(pathname));
  const { progress } = useInterestStep();

  return (
    <View className="flex-1">
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
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="age"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="drinking"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="interest"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="dating-style"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="military"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="smoking"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="tattoo"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Stack.Screen
          name="done"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>
    </View>
  );
}
