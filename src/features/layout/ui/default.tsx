import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

type Props = {
  children: ReactNode;
  className?: string;
};

export const DefaultLayout = ({ children, className }: Props) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
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
