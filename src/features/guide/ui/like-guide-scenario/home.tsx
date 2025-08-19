import { useAuth } from "@/src/features/auth";
import { Feedback } from "@/src/features/feedback";
import {
  CommunityAnnouncement,
  ReviewSlide,
  TipAnnouncement,
} from "@/src/features/home/ui";
import BannerSlide from "@/src/features/home/ui/banner-slide";
import LikeCollapse from "@/src/features/like/ui/like-collapse";
import HistoryCollapse from "@/src/features/matching-history/ui/history-collapse";
import { ImageResources, cn } from "@/src/shared/libs";
import { Image } from "expo-image";
import {
  Platform,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BusinessInfo } from "../../../../shared/ui/business-info";
import { PalePurpleGradient } from "../../../../shared/ui/gradient";
import { Header } from "../../../../shared/ui/header";
import { ImageResource } from "../../../../shared/ui/image-resource";
import { BottomNavigation } from "../../../../shared/ui/navigation";
import { useStep } from "../../hooks/use-step";
import MockPartner from "../../mock/mock-partner";
import { likedMeMock } from "../../utils/mock-data";

function HomeGuide() {
  const { step, setStep } = useStep();
  const insets = useSafeAreaInsets();
  const { my } = useAuth();

  const isLikeStep = step === 0 || step === 2;
  const isHistoryStep = step === 1;

  return (
    <View
      className={cn(
        "flex-1 relative",
        Platform.OS === "web" && "max-w-[468px] w-full self-center"
      )}
    >
      <PalePurpleGradient />

      {isLikeStep && (
        <View
          pointerEvents="none"
          style={[
            styles.highlightContainer,
            { top: insets.top + 166, zIndex: 300 },
          ]}
        >
          <LikeCollapse
            collapse={likedMeMock(my?.gender ?? "MALE")}
            type="likedMe"
          />
          <View style={styles.highlightBorder} />
        </View>
      )}

      {isHistoryStep && (
        <View
          pointerEvents="none"
          style={[
            styles.highlightContainer,
            { top: insets.top, marginTop: 20, zIndex: 300 },
          ]}
        >
          <HistoryCollapse />
          <View style={styles.highlightBorder} />
        </View>
      )}

      {isLikeStep && (
        <>
          <Header
            centered
            logoSize={128}
            showBackButton={false}
            rightContent={
              <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
                <ImageResource
                  resource={ImageResources.GEM}
                  width={41}
                  height={41}
                />
              </TouchableOpacity>
            }
          />

          <ScrollView
            className={cn(
              "flex-1 px-5 flex flex-col gap-y-[14px]",
              Platform.OS === "android" ? "pb-40" : "pb-14"
            )}
          >
            <View style={{ paddingBottom: 4, marginTop: 2 }}>
              <BannerSlide />
            </View>

            <View style={{ marginTop: 20 }}>
              <LikeCollapse
                collapse={likedMeMock(my?.gender ?? "MALE")}
                type="likedMe"
              />
            </View>

            <View className="mt-[18px] flex flex-col gap-y-1.5">
              <Feedback.WallaFeedbackBanner />
            </View>

            <View className="mt-[14px]">
              <MockPartner />
            </View>
            <View style={{ marginTop: 20 }}>
              <HistoryCollapse />
            </View>
            <View>
              <CommunityAnnouncement />
              <ReviewSlide onScrollStateChange={() => {}} />
            </View>

            <View className="my-[25px]">
              <TipAnnouncement />
            </View>

            <BusinessInfo />
          </ScrollView>
          <BottomNavigation />
        </>
      )}

      {isHistoryStep && (
        <>
          <View
            className={cn(
              "flex-1 px-5 flex flex-col gap-y-[14px]",
              Platform.OS === "android" ? "pb-40" : "pb-14"
            )}
            style={{ paddingTop: insets.top }}
          >
            <View style={{ marginTop: 20 }}>
              <HistoryCollapse />
            </View>

            <View>
              <CommunityAnnouncement />
              <ReviewSlide onScrollStateChange={() => {}} />
            </View>

            <View className="my-[25px]">
              <TipAnnouncement />
            </View>

            <BusinessInfo />
          </View>

          <BottomNavigation />
        </>
      )}

      {/* 안내 텍스트 */}
      <View style={styles.infoWrapper}>
        {step === 0 && (
          <>
            <RNText style={styles.infoTitle}>
              좋아요 기능이 새로 생겼어요 ✨️
            </RNText>
            <RNText style={styles.infoDescription}>
              이제 여기서 내가 좋아요한 사람과,
            </RNText>
            <RNText style={styles.infoDescription}>
              나에게 좋아요한 사람을 확인할 수 있어요.
            </RNText>
          </>
        )}
        {step === 1 && (
          <>
            <RNText style={styles.infoTitle}>
              기존 이전 매칭은 여기로 이동했어요
            </RNText>
            <RNText style={styles.infoDescription}>
              매칭 카드 아래에서 바로 확인할 수 있어요
            </RNText>
            <RNText style={styles.infoDescription}>
              놓치지 말고 확인해보세요
            </RNText>
          </>
        )}
        {step === 2 && (
          <>
            <RNText style={styles.infoTitle}>좋아요, 자세히 알아볼까요?</RNText>
            <RNText style={styles.infoDescription}>
              위 버튼을 누르면 바로
            </RNText>
            <RNText style={styles.infoDescription}>
              썸 우편함으로 들어갈 수 있어요
            </RNText>
          </>
        )}
        <RNText style={styles.infoNextHint}>👉 터치해서 다음</RNText>

        <Image
          source={require("@assets/images/instagram-some.png")}
          style={styles.infoSomeImg}
        />
        <Image
          source={require("@assets/images/instagram-lock.png")}
          style={styles.infoLockImg}
        />
      </View>

      {/* 오버레이 */}
      <TouchableOpacity
        style={styles.overlayTouchable}
        onPress={() => setStep(step + 1)}
      />
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  highlightContainer: {
    backgroundColor: "#fff",
    position: "absolute",
    left: 20,
    right: 20,
    marginTop: 20,
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
  overlay: {
    position: "absolute",
    zIndex: 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000080",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  infoWrapper: {
    zIndex: 300,
    bottom: 100,
    position: "absolute",
    alignSelf: "center",
    right: 72,
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
  infoSomeImg: {
    width: 116,
    height: 175,
    position: "absolute",
    top: 20,
    right: -66,
  },
  infoLockImg: {
    width: 52,
    height: 52,
    position: "absolute",
    top: -30,
    left: -30,
    transform: [{ rotate: "-10deg" }],
  },
});

export default HomeGuide;
