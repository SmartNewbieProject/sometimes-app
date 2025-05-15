import { View, TouchableOpacity, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, Show, AnnounceCard } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";
import IdleMatchTimer from '@features/idle-match-timer';
import Loading from '@/src/features/loading';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";
import { environmentStrategy, ImageResources } from '@/src/shared/libs';
import { useCommingSoon } from '@/src/features/admin/hooks';
import { useEffect } from "react";
import { PreSignup } from '@/src/features/pre-signup';
import Event from '@features/event';

const { ui, queries, hooks } = Home;
const { TotalMatchCounter, CommunityAnnouncement, ReviewSlide, TipAnnouncement } = ui;
const { useTotalMatchCountQuery, useTotalUserCountQuery } = queries;
const { useRedirectPreferences } = hooks;

export default function HomeScreen() {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } = useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();
  const { isPreferenceFill, refetchPreferenceFill } = useRedirectPreferences();
  const showCommingSoon = useCommingSoon();
  const { trackEventAction } = Event.hooks.useEventAnalytics('home');

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

  useEffect(() => {
    refetchPreferenceFill();
  }, []);

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
            <TotalMatchCounter count={totalMatchCount + totalUserCount + 1000} />
          </Loading.Lottie>
        </View>

        <View className="mt-[18px] flex flex-col gap-y-1.5">
          <Feedback.WallaFeedbackBanner />
          <Show when={!isPreferenceFill}>
              <AnnounceCard
                emoji={ImageResources.DETAILS}
                emojiSize={{ width: 31, height: 28 }}
                text="나의 이상형을 알려주면, 더 정확한 매칭을 도와드릴게요!"
                onPress={() => router.navigate('/interest')}
              />
          </Show>
        </View>

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

        {/* PreSignup 푸터 컴포넌트 사용 */}
        <PreSignup.Footer trackEventAction={trackEventAction} />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}
