import { Stack } from 'expo-router';
import { View } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui';

export default function UniversityVerificationLayout() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />
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
          name="success"
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
