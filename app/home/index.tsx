import { View, TouchableOpacity, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";
import IdleMatchTimer from '@features/idle-match-timer';
import Loading from '@/src/features/loading';
import { router } from 'expo-router';

const { ui, queries } = Home;
const { TotalMatchCounter, CommunityAnnouncement, ReviewSlide, TipAnnouncement } = ui;
const { useTotalMatchCountQuery } = queries;

export default function HomeScreen() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } = useTotalMatchCountQuery();


  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header
        centered={true}
        logoSize={128}
        showBackButton={false}
        rightContent={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.navigate('/purchase/tickets/rematch')}
          >
            <Image
              source={require('@assets/images/ticket.png')}
              style={{ width: 40, height: 40 }}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-5 flex flex-col gap-y-[14px] pb-14">
        <View>
          <Loading.Lottie
            title="몇 명이 매칭을 신청했을까요?"
            loading={isLoading}
          >
            <TotalMatchCounter count={totalMatchCount} />
          </Loading.Lottie>
        </View>

        <View className="mt-[25px]">
          <IdleMatchTimer />
        </View>

        <View>
          <CommunityAnnouncement />
          <ReviewSlide />
        </View>
        <View className="my-[25px]">
          <TipAnnouncement />
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}
