import { View, TouchableOpacity, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, Show, AnnounceCard, BusinessInfo } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";
import IdleMatchTimer from '@features/idle-match-timer';
import Loading from '@/src/features/loading';
import { router } from 'expo-router';
import { Feedback } from "@features/feedback";
import { ImageResources } from '@/src/shared/libs';
import { useCommingSoon } from '@/src/features/admin/hooks';
import { useEffect } from "react";
import Event from '@features/event';
import { Button, Text } from '@/src/shared/ui';
import { useAuth } from '@/src/features/auth';
import { excludeEmails } from '@/src/features/admin/services';
import { useModal } from '@/src/shared/hooks/use-modal';
import type { Notification } from '@/src/features/home/apis';

const { ui, queries, hooks } = Home;
const { TotalMatchCounter, CommunityAnnouncement, ReviewSlide, TipAnnouncement } = ui;
const { useTotalMatchCountQuery, useTotalUserCountQuery, useNotificationQuery } = queries;
const { useRedirectPreferences } = hooks;

const HomeScreen = () => {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } = useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();
  const { isPreferenceFill, refetchPreferenceFill } = useRedirectPreferences();
  const showCommingSoon = useCommingSoon();
  const { trackEventAction } = Event.hooks.useEventAnalytics('home');
  const { my } = useAuth();
  const { data: notifications } = useNotificationQuery();
  const { showModal } = useModal();

  const handleNavigateToRematch = () => {
    if (process.env.NODE_ENV === 'production') {
      if (!my?.email) return;
      if (excludeEmails.includes(my.email)) {
        router.navigate('/purchase/tickets/rematch');
      } else {
        showCommingSoon();
      }
    } else {
      router.navigate('/purchase/tickets/rematch');
    }
  };

  const onClickAlert = (notification: Notification) => {
    showModal({
      title: notification.title,
      children: (
        <View>
          <Text textColor="black">{notification.content}</Text>
        </View>
      ),
      primaryButton: {
        text: notification.okMessage,
        onClick: () => {
          router.navigate(notification.redirectUrl as '/');
        },
      },
    });
  };

  useEffect(() => {
    refetchPreferenceFill();
    trackEventAction('home_view');
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
            onPress={handleNavigateToRematch}
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
          {notifications?.map((notification) => (
            <AnnounceCard
              theme="alert"
              key={notification.title}
              emojiSize={{ width: 31, height: 28 }}
              text={notification.announcement}
              onPress={() => onClickAlert(notification)}
            />
          ))}
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

        <BusinessInfo />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
};

export default HomeScreen;
