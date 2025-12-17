import { OnboardingScreen } from '@/src/features/onboarding/ui/onboarding-screen';
import { useLocalSearchParams } from 'expo-router';

export default function OnboardingPage() {
  const { source } = useLocalSearchParams<{ source?: string }>();

  return <OnboardingScreen source={source} />;
}
