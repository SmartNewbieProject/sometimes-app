import { AgeRestrictionScreen } from '@/src/features/pass';
import { Stack } from 'expo-router';

export default function AgeRestriction() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'SOMETIME'
        }}
      />
      <AgeRestrictionScreen />
    </>
  );
}
