import { View } from 'react-native';
import { Button, Text, BusinessInfo } from '@shared/ui';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";
import { useTranslation } from 'react-i18next';

interface FooterProps {
  trackEventAction?: (eventName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ trackEventAction = () => {} }) => {
  const { t } = useTranslation();
  return (
    <View className="w-full mt-8">
      <View className="my-1.5">
        <Feedback.WallaFeedbackBanner textContent={t("features.pre-signup.ui.footer.feedback_banner")} />
      </View>
      <View className="w-full px-4 py-3">
        <Button
          variant="primary"
          size="md"
          className="w-full py-3 rounded-full"
          onPress={() => {
            trackEventAction('signup_button_click');
            router.navigate('/auth/signup/terms');
          }}
        >
          {t("features.pre-signup.ui.footer.start_intro_button")}
        </Button>
        <Button
          variant="outline"
          size="md"
          className="w-full py-3 rounded-full mt-3 bg-surface-background border-border-default"
          onPress={() => {
            trackEventAction('login_button_click');
            router.navigate('/auth/login');
          }}
        >
          <Text
            weight="medium"
            size="md"
            className="text-center text-text-inverse"
          >
            {t("features.pre-signup.ui.footer.login_button")}
          </Text>
        </Button>
      </View>
      <BusinessInfo />
    </View>
  );
};
