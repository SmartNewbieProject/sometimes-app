import { usePathname } from "expo-router";
import { semanticColors } from '../../../shared/constants/colors';
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export const DefaultLayout = ({ children, className, style }: Props) => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const keyboardVerticalOffset =
    Platform.OS === "ios"
      ? pathname.startsWith("/community") || pathname.startsWith("/auth/signup")
        ? 0
        : 60
      : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.container, { backgroundColor: semanticColors.surface.background }, style]}
      className={className}
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
