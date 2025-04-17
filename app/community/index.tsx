import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';

export default function CommunityScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />

      {/* Header - Compound Pattern 사용 예시 */}
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton visible={false} />
        </Header.LeftContent>

        <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />

        <Header.RightContent>
          <TouchableOpacity>
            <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
              <Text size="sm" weight="bold" textColor="purple">+</Text>
            </View>
          </TouchableOpacity>
        </Header.RightContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
        <View className="py-10 items-center justify-center">
          <Text size="lg" weight="bold" textColor="black">
            커뮤니티 화면
          </Text>
          <Text size="md" textColor="pale-purple" className="mt-2">
            여기에 커뮤니티 콘텐츠가 표시됩니다.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
