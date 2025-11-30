import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function PartnerViewLayout() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}
