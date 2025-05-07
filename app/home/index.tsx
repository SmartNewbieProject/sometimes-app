import { View, TouchableOpacity, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, Show, AnnounceCard } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";
import IdleMatchTimer from '@features/idle-match-timer';
import Loading from '@/src/features/loading';
import { router } from 'expo-router';
import { environmentStrategy, ImageResources } from '@/src/shared/libs';
import { useCommingSoon } from '@/src/features/admin/hooks';

const { ui, queries, hooks } = Home;
const { TotalMatchCounter, CommunityAnnouncement, ReviewSlide, TipAnnouncement } = ui;
const { useTotalMatchCountQuery } = queries;
const { useRedirectPreferences } = hooks;

export default function HomeScreen() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } = useTotalMatchCountQuery();
  const { isPreferenceFill } = useRedirectPreferences();
  const showCommingSoon = useCommingSoon();

  const onRedirectTicketPurChase = () => {
    environmentStrategy({
      production: () => {
        showCommingSoon();
      },
      development: () => {
        router.navigate('/purchase/tickets/rematch');
      }
    })
  };

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
            onPress={onRedirectTicketPurChase}
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

        <Show when={!isPreferenceFill}>
          <View className="mt-[18px]">
            <AnnounceCard
              emoji={ImageResources.DETAILS}
              emojiSize={{ width: 31, height: 28 }}
              text="나의 이상형을 알려주면, 더 정확한 매칭을 도와드릴게요!"
              onPress={() => router.navigate('/interest')}
            />
          </View>
        </Show>

        <View className="mt-[14px]">
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
