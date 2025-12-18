import { StyleSheet, View } from 'react-native';
import { Button, Text, BusinessInfo } from '@shared/ui';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

interface FooterProps {
  trackEventAction?: (eventName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ trackEventAction = () => {} }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.feedbackContainer}>
        <Feedback.WallaFeedbackBanner textContent={t("features.pre-signup.ui.footer.feedback_banner")} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="md"
          width="full"
          style={styles.primaryButton}
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
          width="full"
          style={styles.outlineButton}
          onPress={() => {
            trackEventAction('login_button_click');
            router.navigate('/auth/login');
          }}
        >
          <Text
            weight="medium"
            size="md"
            textColor="inverse"
            style={styles.loginText}
          >
            {t("features.pre-signup.ui.footer.login_button")}
          </Text>
        </Button>
      </View>
      <BusinessInfo />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 32,
  },
  feedbackContainer: {
    marginVertical: 6,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 9999,
  },
  outlineButton: {
    paddingVertical: 12,
    borderRadius: 9999,
    marginTop: 12,
    backgroundColor: semanticColors.surface.background,
    borderColor: semanticColors.border.default,
  },
  loginText: {
    textAlign: 'center',
  },
});
