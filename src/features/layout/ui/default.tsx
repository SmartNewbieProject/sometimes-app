import { usePathname } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DefaultLayout = ({ children, style }: Props) => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const keyboardVerticalOffset =
    Platform.OS === "ios"
      ? pathname.startsWith("/community") || pathname.startsWith("/auth/signup")
        ? 0
        : 60
      : 0;

  const containerStyle = [styles.container, { backgroundColor: semanticColors.surface.background }, style];

  if (Platform.OS === "web") {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={containerStyle}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
});
