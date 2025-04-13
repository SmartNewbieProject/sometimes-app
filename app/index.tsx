import { useAuth } from '@/src/features/auth';
import { Button } from '@/src/shared/ui';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  const { isAuthorized } = useAuth();

  return (
    <View>
      <Button variant="primary" onPress={() => router.push('/auth/login')}>
        로그인 화면으로 가기
      </Button>
      Hello
    </View>
  )
}
