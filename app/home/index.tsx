import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";
import IdleMatchTimer from '@features/idle-match-timer';

const { ui } = Home;
const { TotalMatchCounter } = ui;


export default function HomeScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header
        centered={true}
        logoSize={128}
        showBackButton={false}
        rightContent={
          <TouchableOpacity>
            <Image
              source={require('@assets/images/ticket.png')}
              style={{ width: 40, height: 40 }}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-5">
        <View>
          <TotalMatchCounter count={15000} />
        </View>

        <View className="mt-[25px]">
          <IdleMatchTimer />
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}
