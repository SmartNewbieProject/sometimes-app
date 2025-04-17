import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header, Button } from '@/src/shared/ui';
import { useAuth } from "@features/auth";
import { Notice } from '@/src/features/mypage/ui/notice';
export default function MyScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      {/* Header - Compound Pattern 사용 예시 */}
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton visible={false} />
        </Header.LeftContent>

        <Header.Logo title="나의 SOMETIME" showLogo={false} logoSize={128} />

        <Header.RightContent>
          <TouchableOpacity>
            <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
              <Text size="sm" weight="bold" textColor="purple">🔒</Text>
            </View>
          </TouchableOpacity>
        </Header.RightContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
          <Notice />

        <View className="py-10 items-center justify-center">
          <Text size="lg" weight="bold" textColor="black">
            마이페이지
          </Text>
          <Text size="md" textColor="pale-purple" className="mt-2">
            여기에 사용자 정보와 설정이 표시됩니다.
          </Text>
          <Button variant="primary" onPress={logout} className="mt-4">로그아웃</Button>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
