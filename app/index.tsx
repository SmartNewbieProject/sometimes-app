import { useAuth } from '@/src/features/auth';
import { Button, Text } from '@/src/shared/ui';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  const { isAuthorized } = useAuth();

  return (
    <View className="flex-1 justify-center items-center p-5 gap-y-4">
      <Text size="lg" weight="bold" textColor="purple" className="mb-6">SOMETIME</Text>

      <Button variant="primary" onPress={() => router.push('/auth/login')} className="w-full">
        로그인 화면으로 가기
      </Button>

      <Button variant="primary" onPress={() => router.push('/home')} className="w-full">
        홈 화면으로 가기
      </Button>

      <Button variant="primary" onPress={() => router.push('/community')} className="w-full">
        커뮤니티 화면으로 가기
      </Button>

      <Button variant="primary" onPress={() => router.push('/my')} className="w-full">
        마이페이지로 가기
      </Button>
    </View>
  )
}
