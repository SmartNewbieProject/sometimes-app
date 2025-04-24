import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header, Button } from '@/src/shared/ui';
import { Notice, Profile, LogoutOrWithdrawal } from '@/src/features/mypage/ui';

export default function MyScreen() {
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
        <View className="pb-20 items-center justify-center">
          <View>
            <Profile />
          </View>
        </View>
          <Notice />
        <View className="py-10 items-center justify-center">
          <LogoutOrWithdrawal/>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
