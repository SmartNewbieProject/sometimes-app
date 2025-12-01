import { platform } from "@shared/libs/platform";
import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface SignupButtonsProps {
  onPress?: () => void;
  onPassLogin?: () => void;
}

export default function SignupButtons({ onPress, onPassLogin }: SignupButtonsProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-flex flex-col px-2 gap-y-2" style={{
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
    }}>
    {onPassLogin ? (
      <Button
        size="md"
        variant="primary"
        onPress={onPassLogin}
        className="w-full"
      >
        {t("features.signup.ui.login_form.pass_auth_login")}
      </Button>
    ) : (
      <>
        <Button
          size="md"
          variant="primary"
          onPress={onPress || (() => {})}
          className="w-full"
        >
          {t("features.signup.ui.login_form.login_button")}
        </Button>
        <Button
          size="md"
          variant="secondary"
          onPress={() => router.push('/auth/signup/terms')}
          className="w-full"
          textColor="purple"
        >
          {t("features.signup.ui.login_form.signup_button")}
        </Button>
      </>
    )}
  </View>
  );
}