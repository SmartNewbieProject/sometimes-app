import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SignupProgress } from '@/src/widgets/auth/signup-progress';

export default function SignupLayout() {
  return (
    <View className="flex-1">
      <SignupProgress />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="email" />
        <Stack.Screen name="password" />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
}
