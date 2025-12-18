import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotificationLayout() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
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