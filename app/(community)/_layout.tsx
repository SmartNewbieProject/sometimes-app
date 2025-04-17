import { Stack } from 'expo-router';
import { View } from 'react-native';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';

export default function CommunityLayout() {
  return (
    <View className="flex-1 bg-white">
      <View className={cn(
        "bg-white",
        platform({
          ios: () => "pt-[50px]",
          android: () => "pt-[50px]",
          web: () => "pt-[14px]",
        })
      )}>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'white',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="article/[id]" 
          options={{ 
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
