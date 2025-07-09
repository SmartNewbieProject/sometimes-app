import type { Notification } from "@/src/features/home/apis";
import HomeInfoCard from "@/src/features/home/ui/home-info/home-info-card";
import HomeInfoSection from "@/src/features/home/ui/home-info/home-info-section";
import MatchingStatus from "@/src/features/home/ui/matching-status";
import Loading from "@/src/features/loading";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources } from "@/src/shared/libs";
import {
  AnnounceCard,
  BottomNavigation,
  BusinessInfo,
  Header,
  PalePurpleGradient,
  Show,
} from "@/src/shared/ui";
import Event from "@features/event";
import { Feedback } from "@features/feedback";
import Home from "@features/home";
import IdleMatchTimer from "@features/idle-match-timer";
import { Text } from "@shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";

const { ui, queries, hooks } = Home;
const {
  TotalMatchCounter,
  CommunityAnnouncement,
  ReviewSlide,
  TipAnnouncement,
} = ui;
const {
  useTotalMatchCountQuery,
  useTotalUserCountQuery,
  useNotificationQuery,
  usePreferenceSelfQuery,
} = queries;
const { useRedirectPreferences } = hooks;

const HomeScreen = () => {
  const { data: { count: totalMatchCount } = { count: 0 }, isLoading } =
    useTotalMatchCountQuery();
  const { data: totalUserCount = 0 } = useTotalUserCountQuery();

  const { isPreferenceFill } = useRedirectPreferences();
  const { data: preferencesSelf } = usePreferenceSelfQuery();
  const { trackEventAction } = Event.hooks.useEventAnalytics("home");
  const { data: notifications } = useNotificationQuery();
  const { showModal } = useModal();
  const queryClient = useQueryClient();

  const handleNavigateToRematch = () => {
    router.navigate("/purchase/tickets/rematch");
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
          router.navigate(notification.redirectUrl as "/");
        },
      },
    });
  };

  useEffect(() => {
    trackEventAction("home_view");
  }, []);

  // 화면이 포커스될 때마다 매칭 데이터 리프레시
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["notification", "check-preference-fill", "latest-matching"],
        refetchType: "active",
      });
    }, [queryClient])
  );

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
              source={require("@assets/images/ticket.png")}
              style={{ width: 40, height: 40 }}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className={`flex-1 px-5 flex flex-col gap-y-[14px] ${
          Platform.OS === "android" ? "pb-40" : "pb-14"
        }`}
      >
        <View>
          <Loading.Lottie
            title="몇 명이 매칭을 신청했을까요?"
            loading={isLoading}
          >
            <TotalMatchCounter
              count={totalMatchCount + totalUserCount + 1000}
            />
          </Loading.Lottie>
        </View>

        <View className="mt-[18px] flex flex-col gap-y-1.5">
          <Feedback.WallaFeedbackBanner />
          <Show when={!isPreferenceFill}>
            <AnnounceCard
              emoji={ImageResources.DETAILS}
              emojiSize={{ width: 31, height: 28 }}
              text="나의 이상형을 알려주면, 더 정확한 매칭을 도와드릴게요!"
              onPress={() => router.navigate("/interest")}
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

        {!isPreferenceFill || preferencesSelf?.length === 0 ? (
          <View style={{ gap: 14 }}>
            <HomeInfoSection />
            <MatchingStatus />
          </View>
        ) : (
          <View className="mt-[14px]">
            <IdleMatchTimer />
          </View>
        )}

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
