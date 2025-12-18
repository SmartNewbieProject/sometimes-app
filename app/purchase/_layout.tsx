import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { PortoneProvider } from '@/src/features/payment/hooks/PortoneProvider';

export default function PurchaseLayout() {
  return (
    <PortoneProvider>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen
              name="gem-store"
              options={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
                animation: 'slide_from_right'
              }}
          />
          <Stack.Screen
            name="tickets"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen
            name="complete"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
              animation: 'slide_from_right'
            }}
          />
        </Stack>
      </View>
    </PortoneProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
