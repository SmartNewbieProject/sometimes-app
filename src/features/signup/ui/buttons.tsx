import { platform } from "@shared/libs/platform";
import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { View, StyleSheet } from "react-native";

interface SignupButtonsProps {
  onPress?: () => void;
  onPassLogin?: () => void;
}

export default function SignupButtons({ onPress, onPassLogin }: SignupButtonsProps) {
  return (
    <View style={styles.container}>
    {onPassLogin ? (
      <Button
        size="md"
        variant="primary"
        onPress={onPassLogin}
        style={styles.button}
      >
        PASS 인증으로 로그인
      </Button>
    ) : (
      <>
        <Button
          size="md"
          variant="primary"
          onPress={onPress || (() => {})}
          style={styles.button}
        >
          로그인
        </Button>
        <Button
          size="md"
          variant="secondary"
          onPress={() => router.push('/auth/signup/terms')}
          style={styles.button}
          textColor="purple"
        >
          회원가입
        </Button>
      </>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    flexDirection: 'column',
    paddingHorizontal: 8,
    rowGap: 8,
    ...platform({
      ios: () => ({
        paddingTop: 58,
        paddingBottom: 58,
      }),
      android: () => ({
        paddingTop: 58,
        paddingBottom: 58,
      }),
      web: () => ({
        paddingTop: 14,
        paddingBottom: 0,
      }),
    })
  },
  button: {
    width: '100%'
  }
});
