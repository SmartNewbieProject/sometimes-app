import { platform } from "@shared/libs/platform";
import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

interface SignupButtonsProps {
  onPress?: () => void;
  onPassLogin?: () => void;
}

export default function SignupButtons({ onPress, onPassLogin }: SignupButtonsProps) {
  const { t } = useTranslation();
  return (
    <View style={[
      styles.container,
      platform({
        ios: () => styles.paddingNative,
        android: () => styles.paddingNative,
        web: () => styles.paddingWeb,
      })
    ]}>
      {onPassLogin ? (
        <Button
          size="md"
          variant="primary"
          onPress={onPassLogin}
          width="full"
        >
          {t("features.signup.ui.login_form.pass_auth_login")}
        </Button>
      ) : (
        <>
          <Button
            size="md"
            variant="primary"
            onPress={onPress || (() => {})}
            width="full"
          >
            {t("features.signup.ui.login_form.login_button")}
          </Button>
          <Button
            size="md"
            variant="secondary"
            onPress={() => router.push('/auth/signup/terms' as any)}
            width="full"
            textColor="purple"
          >
            {t("features.signup.ui.login_form.signup_button")}
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingHorizontal: 8,
    gap: 8,
  },
  paddingNative: {
    paddingTop: 58,
    paddingBottom: 58,
  },
  paddingWeb: {
    paddingTop: 14,
    paddingBottom: 0,
  },
});
