import { View } from 'react-native';
import { Button, Text, BusinessInfo } from '@shared/ui';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";

interface FooterProps {
  trackEventAction?: (eventName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ trackEventAction = () => {} }) => {
  return (
    <View className="w-full mt-8">
      <View className="my-1.5">
        <Feedback.WallaFeedbackBanner textContent="연애에서 바라는 점, 소통 방식을 알려주세요!" />
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
          소개팅 시작하기
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
            로그인하기
          </Text>
        </Button>
      </View>
      <BusinessInfo />
    </View>
  );
};
