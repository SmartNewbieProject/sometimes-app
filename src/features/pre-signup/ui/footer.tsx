import { View, StyleSheet } from 'react-native';
import { Button, Text, BusinessInfo } from '@shared/ui';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/colors';

interface FooterProps {
  trackEventAction?: (eventName: string) => void;
}

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
  signupButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
    backgroundColor: semanticColors.surface.background,
    borderColor: semanticColors.border.default,
  },
  loginButtonText: {
    textAlign: 'center',
    color: colors.textInverse,
  },
});

export const Footer: React.FC<FooterProps> = ({ trackEventAction = () => {} }) => {
  return (
    <View style={styles.container}>
      <View style={styles.feedbackContainer}>
        <Feedback.WallaFeedbackBanner textContent="연애에서 바라는 점, 소통 방식을 알려주세요!" />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="md"
          style={styles.signupButton}
          onPress={() => {
            trackEventAction('signup_button_click');
            router.navigate('/auth/signup/terms');
          }}
        >
          소개팅 시작하기
        </Button>
        <Button
          variant="outline"
          size="md"
          style={styles.loginButton}
          onPress={() => {
            trackEventAction('login_button_click');
            router.navigate('/auth/login');
          }}
        >
          <Text
            weight="medium"
            size="md"
            textColor="text-inverse"
          >
            로그인하기
          </Text>
        </Button>
      </View>
      <BusinessInfo />
    </View>
  );
};
