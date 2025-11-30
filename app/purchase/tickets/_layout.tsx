import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function PurchaseLayout() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="rematch"
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
  );
}
