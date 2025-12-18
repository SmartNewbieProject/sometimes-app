import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function CommunityLayout() {
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
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="write"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="update/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="report"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="my/my-articles"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="my/my-comments"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="my/my-liked"
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
