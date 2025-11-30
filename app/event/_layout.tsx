import { PalePurpleGradient } from '@/src/shared/ui';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function EventLayout() {
  return (
    <View style={styles.container}>
      <PalePurpleGradient />
      <Stack>
        <Stack.Screen
          name="pre-signup"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
