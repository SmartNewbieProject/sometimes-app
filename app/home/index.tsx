import { useRouletteEligibility } from "@/src/features/event/hooks/roulette/use-roulette-eligibility";
import RouletteModal from "@/src/features/event/ui/roulette/roulette-modal";
import { useStep } from "@/src/features/guide/hooks/use-step";
import useMatchingFirst from "@/src/features/guide/queries/use-maching-first";
import LikeGuideScenario from "@/src/features/guide/ui/like-guide-scenario";
import type { Notification } from "@/src/features/home/apis";
import BannerSlide from "@/src/features/home/ui/banner-slide";
import FirstPurchaseEvent from "@/src/features/home/ui/first-purchase-event-banner";
import HomeInfoSection from "@/src/features/home/ui/home-info/home-info-section";
import MatchingStatus from "@/src/features/home/ui/matching-status";
import useLiked from "@/src/features/like/hooks/use-liked";
import LikeCollapse from "@/src/features/like/ui/like-collapse";
import NoneLikeBanner from "@/src/features/like/ui/none-like-banner";
import Loading from "@/src/features/loading";
import HistoryCollapse from "@/src/features/matching-history/ui/history-collapse";
import {
  VersionUpdateChecker,
  useVersionUpdate,
} from "@/src/features/version-update";
import WelcomeReward from "@/src/features/welcome-reward";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { ImageResources, storage } from "@/src/shared/libs";
import { ensurePushTokenRegistered } from "@/src/shared/libs/notifications";
import {
  AnnounceCard,
  BottomNavigation,
  BusinessInfo,
  Header,
  PalePurpleGradient,
  Show,
} from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import { useAuth } from "@features/auth";
import Event from "@features/event";
import { Feedback } from "@features/feedback";
import Home from "@features/home";
import IdleMatchTimer from "@features/idle-match-timer";
import { Text } from "@shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { ImageResource } from "@ui/image-resource";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";

const { ui, queries, hooks } = Home;
const {
  TotalMatchCounter,
  CommunityAnnouncement,
  ReviewSlide,
  TipAnnouncement,
} = ui;
const { usePreferenceSelfQuery } = queries;
const { useRedirectPreferences, useTemporalUniversity } = hooks;

const { ui: welcomeRewardUI, hooks: welcomeRewardHooks } = WelcomeReward;
const { WelcomeRewardModal } = welcomeRewardUI;
const { useWelcomeReward } = welcomeRewardHooks;

const HomeScreen = () => {
  const { showModal } = useModal();
  const { step } = useStep();
  const { isPreferenceFill } = useRedirectPreferences();
  const { data: preferencesSelf } = usePreferenceSelfQuery();
  const { trackEventAction } = Event.hooks.useEventAnalytics("home");
  const { my } = useAuth();
  const queryClient = useQueryClient();
  const [isSlideScrolling, setSlideScrolling] = useState(false);
  const { showCollapse } = useLiked();
  const collapse = showCollapse();
  // const [tutorialFinished, setTutorialFinished] = useState<boolean>(false);
  const { data: hasFirst, isLoading: hasFirstLoading } = useMatchingFirst();

  const { value, setValue, loading } = useStorage<string | null>({
    key: "show-push-token-modal",
  });
  // 환영 보상 관련
  const { shouldShowReward, markRewardAsReceived } = useWelcomeReward();
  // useEffect(() => {
  //   const fetchTutorialStatus = async () => {
  //     const finished = await storage.getItem("like-guide");

  //     setTutorialFinished(finished === "true");
  //   };
  //   fetchTutorialStatus();
  // }, []);

  const { data, isLoading, isError, error } = useRouletteEligibility();

  useEffect(() => {
    if (data?.canParticipate) {
      showModal({ custom: RouletteModal });
    }
  }, [data?.canParticipate]);

  // const visibleLikeGuide =
  //   step < 11 && !tutorialFinished && !hasFirstLoading && hasFirst;

  const onScrollStateChange = (bool: boolean) => {
    setSlideScrolling(bool);
  };

  const onNavigateGemStore = () => {
    track("onNavigateGemStore", {
      ...my,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    router.navigate("/purchase/gem-store");
  };

  useEffect(() => {
    trackEventAction("home_view");
    if (!loading && value !== "true") {
      ensurePushTokenRegistered(showModal);
      setValue("true");
    }
  }, [showModal]);

  useTemporalUniversity();
  useVersionUpdate();

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
    <View className="flex-1 ">
      <PalePurpleGradient />
      <VersionUpdateChecker />
      {/* <LikeGuideScenario visible={!!visibleLikeGuide} hideModal={() => {}} /> */}
      <WelcomeRewardModal
        visible={shouldShowReward}
        onClose={markRewardAsReceived}
      />
      <Header
        centered={true}
        logoSize={128}
        showBackButton={false}
        rightContent={
          <TouchableOpacity activeOpacity={0.8} onPress={onNavigateGemStore}>
            <ImageResource
              resource={ImageResources.GEM}
              width={41}
              height={41}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        scrollEnabled={!isSlideScrolling}
        className={`flex-1 px-5 flex flex-col gap-y-[14px] ${
          Platform.OS === "android" ? "pb-40" : "pb-14"
        }`}
      >
        <View style={{ paddingBottom: 4, marginTop: 2 }}>
          <BannerSlide />
        </View>
        <View style={{ marginTop: 20 }}>
          {collapse ? (
            <LikeCollapse collapse={collapse.data} type={collapse.type} />
          ) : (
            <NoneLikeBanner />
          )}
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
        <View style={{ marginTop: 20 }}>
          <HistoryCollapse />
        </View>
        <View>
          <CommunityAnnouncement />
          <ReviewSlide onScrollStateChange={onScrollStateChange} />
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
