import MyInfo from "@/src/features/my-info";
import { useMyInfoStep } from "@/src/features/my-info/hooks";
import { cn } from "@/src/shared/libs";
import { platform } from "@/src/shared/libs/platform";
import { ProgressBar } from "@/src/shared/ui";
import { Stack, usePathname } from "expo-router";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { hooks } = MyInfo;
const { useMyInfoForm } = hooks;

export default function InterestLayout() {
  const pathname = usePathname();
  const renderProgress = !["/my-info", "/my-info/done"].includes(pathname);
  const { progress } = useMyInfoStep();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      className="flex-1"
    >
      <View style={styles.contentContainer}>
        {renderProgress && (
          <View style={styles.progress}>
            <ProgressBar progress={progress} />
          </View>
        )}
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
            name="mbti"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="personality"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="drinking"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="interest"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="dating-style"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="military"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="smoking"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="tattoo"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          <Stack.Screen
            name="done"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const progressStyle: ViewStyle = {
  paddingHorizontal: 30,
  paddingBottom: Platform.OS === "web" ? 8 : 27,
  paddingTop: Platform.select({
    ios: 33,
    android: 33,
    web: 33,
    default: 0,
  }),
  alignItems: "center",
  backgroundColor: "#FFFFFF",
};

const styles = StyleSheet.create({
  progress: progressStyle,
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
});
