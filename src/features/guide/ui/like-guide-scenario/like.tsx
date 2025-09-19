import { useAuth } from "@/src/features/auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import PostBoxCard, {
  ILikedRejectedButton,
  LikedMePendingButton,
} from "@/src/features/post-box/ui/post-box-card";
import PostBoxHeaders from "@/src/features/post-box/ui/post-box-header";
import { type Tab, ToggleTab } from "@/src/features/post-box/ui/toggle-tab";
import { cn, storage } from "@/src/shared/libs";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStep } from "../../hooks/use-step";
import MockTime from "../../mock/mock-time";
import { mockILiked, mockLikedMe } from "../../utils/mock-data";

function LikeGuide() {
  const { t } = useTranslation();
  const TABS: Tab[] = [
    {
      id: "liked-me",
      label: t("features.guide.ui.like_guide_scenario.like.tab_liked_me"),
    },
    { id: "i-liked", label: t("features.guide.ui.like_guide_scenario.like.tab_i_liked") },
  ];
  const { step, setStep } = useStep();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>("i-liked");
  const { my } = useAuth();

  useEffect(() => {
    if (step === 4) setActiveTab("liked-me");
    if (step === 8) setActiveTab("i-liked");
  }, [step]);

  const renderHighlightCard = () => {
    const commonStyle = {
      marginTop: 20,
      backgroundColor: "#fff",
      position: "absolute" as const,
      left: 18,
      right: 18,
      zIndex: 300,
    };

    switch (step) {
      case 3:
      case 4:
        return (
          <Pressable
            pointerEvents="none"
            style={{
              top: insets.top + 46,
              position: "absolute" as const,
              alignSelf: "center",
              alignItems: "center",
              zIndex: 300,
              marginTop: 20,
              borderRadius: 24,
            }}
          >
            <ToggleTab
              tabs={TABS}
              activeTab={activeTab}
              onTabClick={() => {}}
            />
            <View style={[styles.highlightBorder, { borderRadius: 24 }]} />
          </Pressable>
        );
      case 5:
        return (
          <Pressable
            pointerEvents="none"
            style={{ ...commonStyle, top: insets.top + 112 }}
          >
            <PostBoxCard
              {...mockLikedMe(my?.gender ?? "MALE")}
              type="liked-me"
            />
            <View style={styles.highlightBorder} />
          </Pressable>
        );
      case 6:
      case 7:
        return (
          <Pressable
            pointerEvents="none"
            style={{
              marginTop: 20,
              backgroundColor: "#fff",
              position: "absolute",
              top: insets.top + 234,
              borderRadius: 18,
              height: 40,
              left: 106,
              right: 34,
              zIndex: 300,
            }}
          >
            <LikedMePendingButton connectionId="" />
            <View style={[styles.highlightBorder, { borderRadius: 18 }]} />
          </Pressable>
        );
      case 8:
        return (
          <Pressable
            pointerEvents="none"
            style={{ ...commonStyle, top: insets.top + 112 }}
          >
            <PostBoxCard {...mockILiked(my?.gender ?? "MALE")} type="i-liked" />
            <View style={styles.highlightBorder} />
          </Pressable>
        );
      case 9:
        return (
          <Pressable
            pointerEvents="none"
            style={{
              marginTop: 20,
              backgroundColor: "#fff",
              position: "absolute",
              top: insets.top + 212,
              height: 20,
              left: 106,
              right: 34,
              zIndex: 300,
            }}
          >
            <MockTime
              matchExpiredAt={mockILiked(my?.gender ?? "MALE").matchExpiredAt}
            />
            <View style={styles.highlightBorder} />
          </Pressable>
        );
      default:
        return null;
    }
  };

  const renderInfo = () => {
    switch (step) {
      case 3:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step3_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step3_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step3_desc2")}
            </RNText>
          </>
        );
      case 4:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step4_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step4_desc1")}
            </RNText>
          </>
        );
      case 5:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step5_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step5_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step5_desc2")}
            </RNText>
          </>
        );
      case 6:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step6_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step6_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step6_desc2")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step6_desc3")}
            </RNText>
          </>
        );
      case 7:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step7_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step7_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step7_desc2")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step7_desc3")}
            </RNText>
          </>
        );
      case 8:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step8_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step8_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step8_desc2")}
            </RNText>
          </>
        );
      case 9:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step9_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step9_desc1")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step9_desc2")}
            </RNText>
          </>
        );
      case 10:
        return (
          <>
            <RNText style={styles.infoTitle}>
              {t("features.guide.ui.like_guide_scenario.like.info.step10_title")}
            </RNText>
            <RNText style={styles.infoDescription}>
              {t("features.guide.ui.like_guide_scenario.like.info.step10_desc1")}
            </RNText>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DefaultLayout
      className={cn(
        "flex-1 relative",
        Platform.OS === "web" && "max-w-[468px] w-full self-center"
      )}
    >
      {renderHighlightCard()}

      <PostBoxHeaders />

      <View style={styles.toggleContainer}>
        <ToggleTab
          tabs={TABS}
          activeTab={activeTab}
          onTabClick={() =>
            setActiveTab(activeTab === "i-liked" ? "liked-me" : "i-liked")
          }
        />
      </View>

      {activeTab === "liked-me" && (
        <View style={{ marginHorizontal: 18 }}>
          <PostBoxCard {...mockLikedMe(my?.gender ?? "MALE")} type="liked-me" />
        </View>
      )}
      {activeTab === "i-liked" && (
        <View style={{ marginHorizontal: 18 }}>
          <PostBoxCard {...mockILiked(my?.gender ?? "MALE")} type="i-liked" />
        </View>
      )}

      <View style={styles.infoWrapper}>
        {renderInfo()}
        <RNText style={styles.infoNextHint}>
          {step === 10
            ? t("features.guide.ui.like_guide_scenario.like.info.close_hint")
            : t("features.guide.ui.home.info_next_hint")}
        </RNText>
        <Image
          source={require("@assets/images/instagram-some.png")}
          style={{
            width: 116,
            height: 175,
            position: "absolute",
            top: 20,
            right: -66,
          }}
        />
        <Image
          source={require("@assets/images/instagram-lock.png")}
          style={{
            width: 52,
            height: 52,
            position: "absolute",
            top: -30,
            left: -30,
            transform: [{ rotate: "-10deg" }],
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.overlayTouchable}
        onPress={async () => {
          if (step === 10) await storage.setItem("like-guide", "true");
          setStep(step + 1);
        }}
      />

      <View style={[styles.overlay, { backgroundColor: "#00000080" }]} />
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
    paddingBottom: 10,
  },
  overlay: {
    position: "absolute",
    zIndex: 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  highlightBorder: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#9F84D8",
    backgroundColor: "transparent",
  },
  infoWrapper: {
    zIndex: 300,
    bottom: 100,
    position: "absolute",
    right: 72,
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",
    shadowColor: "#F2ECFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    color: "#9F84D8",
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 12,
    lineHeight: 13.4,
    color: "#7A6FA3",
  },
  infoNextHint: {
    fontSize: 11,
    lineHeight: 14,
    color: "#9F84D8",
    fontWeight: "500",
    marginTop: 10,
    textAlign: "left",
  },
});

export default LikeGuide;