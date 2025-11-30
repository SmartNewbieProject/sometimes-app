import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import PostBoxCard, {
  ILikedRejectedButton,
  LikedMePendingButton,
} from "@/src/features/post-box/ui/post-box-card";
import PostBoxHeaders from "@/src/features/post-box/ui/post-box-header";
import { type Tab, ToggleTab } from "@/src/features/post-box/ui/toggle-tab";
import { storage } from "@/src/shared/libs";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStep } from "../../hooks/use-step";
import MockTime from "../../mock/mock-time";
import { mockILiked, mockLikedMe } from "../../utils/mock-data";

const TABS: Tab[] = [
  { id: "liked-me", label: "도착한 썸" },
  { id: "i-liked", label: "보낸 썸" },
];

function LikeGuide() {
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
      backgroundColor: semanticColors.surface.background,
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
              backgroundColor: semanticColors.surface.background,
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
              backgroundColor: semanticColors.surface.background,
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
            <RNText style={styles.infoTitle}>보낸 썸</RNText>
            <RNText style={styles.infoDescription}>
              내가 먼저 마음을 표현한
            </RNText>
            <RNText style={styles.infoDescription}>
              사람들을 볼 수 있어요
            </RNText>
          </>
        );
      case 4:
        return (
          <>
            <RNText style={styles.infoTitle}>도착한 썸</RNText>
            <RNText style={styles.infoDescription}>
              누가 나에게 호감을 보냈는지 바로 확인해요
            </RNText>
          </>
        );
      case 5:
        return (
          <>
            <RNText style={styles.infoTitle}>프로필 미리보기</RNText>
            <RNText style={styles.infoDescription}>
              여기서 프로필 미리보기를 확인할 수 있어요
            </RNText>
            <RNText style={styles.infoDescription}>
              카드를 누르면 상세 프로필로 이동해요
            </RNText>
          </>
        );
      case 6:
        return (
          <>
            <RNText style={styles.infoTitle}>좋아요</RNText>
            <RNText style={styles.infoDescription}>
              좋아요를 누르면 서로 매칭돼요!
            </RNText>
            <RNText style={styles.infoDescription}>
              매칭이 되면 인스타그램에서
            </RNText>
            <RNText style={styles.infoDescription}>
              대화를 시작할 수 있어요
            </RNText>
          </>
        );
      case 7:
        return (
          <>
            <RNText style={styles.infoTitle}>괜찮아요</RNText>
            <RNText style={styles.infoDescription}>
              관심이 없으면 ‘괜찮아요’를 눌러주세요
            </RNText>
            <RNText style={styles.infoDescription}>
              이번 인연은 아쉽게 마무리되고,
            </RNText>
            <RNText style={styles.infoDescription}>카드가 사라져요</RNText>
          </>
        );
      case 8:
        return (
          <>
            <RNText style={styles.infoTitle}>인연이 아니였나봐요</RNText>
            <RNText style={styles.infoDescription}>카드는 사라지고,</RNText>
            <RNText style={styles.infoDescription}>
              다음 인연을 확인할 수 있어요
            </RNText>
          </>
        );
      case 9:
        return (
          <>
            <RNText style={styles.infoTitle}>만료 안내</RNText>
            <RNText style={styles.infoDescription}>
              표시된 시간이 지나면 자동으로
            </RNText>
            <RNText style={styles.infoDescription}>
              ‘인연이 아니였나봐요’로 처리돼요.
            </RNText>
          </>
        );
      case 10:
        return (
          <>
            <RNText style={styles.infoTitle}>튜토리얼이 끝났어요!</RNText>
            <RNText style={styles.infoDescription}>
              이제 나만의 이상형을 만나러 가볼까요?
            </RNText>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DefaultLayout
      style={[
        styles.defaultLayout,
        Platform.OS === "web" && styles.webContainer
      ]}
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
          {step === 10 ? "👉 튜토리얼 닫기" : "👉 터치해서 다음"}
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

      <View style={[styles.overlay, { backgroundColor: semanticColors.surface.inverse }]} />
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  defaultLayout: {
    flex: 1,
    position: 'relative',
  },
  webContainer: {
    maxWidth: 468,
    width: '100%',
    alignSelf: 'center',
  },
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
    borderColor: semanticColors.brand.accent,
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
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    shadowColor: "#F2ECFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    color: semanticColors.brand.accent,
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
    color: semanticColors.brand.accent,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "left",
  },
});

export default LikeGuide;
