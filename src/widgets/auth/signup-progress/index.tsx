import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { Text } from '@/src/shared/ui/text';

const SIGNUP_STEPS = [
  { path: '/signup', label: '약관동의' },
  { path: '/signup/email', label: '이메일' },
  { path: '/signup/password', label: '비밀번호' },
  { path: '/signup/profile', label: '프로필' },
];

export const SignupProgress = () => {
  const pathname = usePathname();
  const currentStep = SIGNUP_STEPS.findIndex(step => step.path === pathname) + 1;
  const progress = (currentStep / SIGNUP_STEPS.length) * 100;

  return (
    <View className="px-5 pt-10">
      <View className="flex-row justify-between items-center mb-2">
        <Text size="lg" weight="semibold">
          회원가입 ({currentStep}/{SIGNUP_STEPS.length})
        </Text>
        <Text size="sm" className="text-gray-500">
          {SIGNUP_STEPS[currentStep - 1]?.label}
        </Text>
      </View>
      <View className="h-1 bg-gray-200 rounded-full">
        <View 
          className="h-full bg-primaryPurple rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}; 