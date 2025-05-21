import { View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header, Button } from '@/src/shared/ui';
import { Notice, Profile, LogoutOrWithdrawal, ProfileMenu } from '@/src/features/mypage/ui';
import { Image } from 'expo-image';

export default function MyScreen() {

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header.Container className='mt-2'>
        <Header.LeftContent>
          <Header.LeftButton visible={false} />
        </Header.LeftContent>
        <Header.CenterContent>
          <Image
            source={require('@assets/images/MY_LOGO.png')}
            style={{ width: 40, height: 20 }}
            contentFit="contain"
          />
        </Header.CenterContent>

        <Header.RightContent>
          <TouchableOpacity>
            {/* TODO: 정식 오픈 시 주석 해제 필요 */}
            {/* <View className="w-10 h-10 bg-lightPurple rounded-full items-center justify-center">
              <Text size="sm" weight="bold" textColor="purple">🔒</Text>
            </View> */}
          </TouchableOpacity>
        </Header.RightContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
        <View className="pb-20 items-center justify-center">
          <View>
            <Profile />
          </View>
        </View>
          {/* TODO: 정식 오픈 시 주석 해제 필요 */}
          {/* <Notice />
        <View className="py-10 items-center justify-center"> */}
        <View className="items-center flex flex-col gap-y-4 justify-center"> {/* TODO: 정식 오픈 시 주석 해제 필요 */}
          <ProfileMenu />
          <LogoutOrWithdrawal/>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
