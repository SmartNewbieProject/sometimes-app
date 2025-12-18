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
import { useTranslation } from 'react-i18next';
import {
  AnnounceCard,
  BottomNavigation,
  BusinessInfo,
  Header,
  PalePurpleGradient,
  Show,
 Text } from "@/src/shared/ui";
import { NotificationIcon } from "@/src/features/notification/ui/notification-icon";
import { track } from "@/src/shared/libs/amplitude-compat";
import { useAuth } from "@features/auth";
import Event from "@features/event";
import { Feedback } from "@features/feedback";
import Home from "@features/home";
import IdleMatchTimer from "@features/idle-match-timer";
import { useQueryClient } from "@tanstack/react-query";
import { ImageResource } from "@ui/image-resource";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { step } = useStep();
  const {
    isPreferenceFill,
    onboardingLoading,
  } = useRedirectPreferences();
  const { data: preferencesSelf, isLoading: isPreferencesSelfLoading } = usePreferenceSelfQuery();
  const { trackEventAction } = Event.hooks.useEventAnalytics("home");
  const { my, profileDetails } = useAuth();
  const queryClient = useQueryClient();
  const [isSlideScrolling, setSlideScrolling] = useState(false);
  const { showCollapse } = useLiked();
  const collapse = showCollapse();
  // const [tutorialFinished, setTutorialFinished] = useState<boolean>(false);
  // const { data: hasFirst, isLoading: hasFirstLoading } = useMatchingFirst();

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

  const renderMatchingSection = () => {
    const hasProfileImages = profileDetails?.profileImages && profileDetails.profileImages.length > 0;
    const hasCharacteristics = preferencesSelf && preferencesSelf.length > 0;
    const hasPreferences = isPreferenceFill;

    const isProfileComplete = hasProfileImages && hasCharacteristics && hasPreferences;
    if (onboardingLoading) {
      return (
        <View style={styles.matchingSection}>
          <IdleMatchTimer />
        </View>
      );
    }

    if (isProfileComplete) {
      return (
        <View style={styles.matchingSection}>
          <IdleMatchTimer />
        </View>
      );
    }

    return (
      <View style={{ gap: 14 }}>
        <HomeInfoSection />
        <MatchingStatus />
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 16 }}>
            <NotificationIcon size={41} />
            <TouchableOpacity activeOpacity={0.8} onPress={onNavigateGemStore}>
              <ImageResource
                resource={ImageResources.GEM}
                width={41}
                height={41}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        scrollEnabled={!isSlideScrolling}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
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
        <View style={styles.feedbackSection}>
          <Feedback.WallaFeedbackBanner />
          <Show when={!isPreferenceFill}>
            <AnnounceCard
              emoji={ImageResources.DETAILS}
              emojiSize={{ width: 31, height: 28 }}
              text={t("apps.home.announce_card_text")}
              onPress={() => router.navigate("/interest")}
            />
          </Show>
        </View>

        {renderMatchingSection()}
        <View style={{ marginTop: 20 }}>
          <HistoryCollapse />
        </View>
        <View>
          <CommunityAnnouncement />
          <ReviewSlide onScrollStateChange={onScrollStateChange} />
        </View>
        <View style={styles.tipSection}>
          <TipAnnouncement />
        </View>

        <BusinessInfo />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  matchingSection: {
    marginTop: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    flexDirection: "column",
    gap: 14,
    paddingBottom: 20,
  },
  feedbackSection: {
    marginTop: 18,
    flexDirection: "column",
    gap: 6,
  },
  tipSection: {
    marginVertical: 25,
  },
});

export default HomeScreen;
