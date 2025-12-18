import useLiked from "@/src/features/like/hooks/use-liked";
import { LikeButton } from "@/src/features/like/ui/like-button";
import {
  ILikedRejectedButton,
  InChatButton,
  LikedMeOpenButton,
} from "@/src/features/post-box/ui/post-box-card";
import PhotoSlider from "@/src/widgets/slide/photo-slider";
import Loading from "@features/loading";
import Match from "@features/match";
import MatchReasons from "@/src/features/match-reasons";
import MatchingAnalysis from "@/src/features/match-reasons/ui/matching-analysis";
import {
  MihoIntroModal,
  PartnerBasicInfo,
  PartnerMBTI,
  MatchingReasonCard,
} from "@/src/features/match/ui";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { BlurredPhotoCard } from "@/src/widgets/blurred-photo-card";
import {
  cn,
  formatLastLogin,
  getSmartUnivLogoUrl,
  parser,
} from "@/src/shared/libs";
import Feather from "@expo/vector-icons/Feather";
import {
  Button,
  Show,
  Text,
  HeaderWithNotification,
} from "@shared/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text as RNText,
} from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { AMPLITUDE_KPI_EVENTS } from "@/src/shared/constants/amplitude-kpi-events";

const { queries } = Match;
const { useMatchPartnerQuery } = queries;
const { useMatchReasonsQuery } = MatchReasons.queries;

export default function PartnerDetailScreen() {
  const { t } = useTranslation();
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
  const { data: matchReasonsData } = useMatchReasonsQuery(partner?.connectionId);
  const { profileDetails } = useAuth();
  const [isZoomVisible, setZoomVisible] = useState(false);
  const { isStatus, isLiked, isExpired } = useLiked();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMihoIntro, setShowMihoIntro] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const hasTrackedView = useRef(false);

  // 내 승인된 사진 개수 계산
  const myApprovedPhotosCount = profileDetails?.profileImages?.filter(
    (img) => img.reviewStatus?.toUpperCase() === 'APPROVED'
  ).length ?? 0;

  useEffect(() => {
    if (!partner) return;

    // 재방문 (isFirstView: false) - 애니메이션/모달 스킵
    if (partner.isFirstView === false) {
      setIsAnalyzing(false);
      setShowMihoIntro(false);

      // Amplitude 트래킹만 실행
      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        const amplitude = (global as any).amplitude || {
          track: (event: string, properties: any) => {
            console.log('Amplitude Event:', event, properties);
          },
        };

        amplitude.track(AMPLITUDE_KPI_EVENTS.PROFILE_VIEWED, {
          viewed_profile_id: partner.id,
          view_source: 'matching_history',
          partner_age: partner.age,
          partner_university: partner.universityDetails?.name,
          timestamp: new Date().toISOString(),
        });
      }
      return;
    }

    // 최초 방문 (isFirstView: true 또는 undefined) - 애니메이션 + 모달 표시
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setShowMihoIntro(true);

      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        const amplitude = (global as any).amplitude || {
          track: (event: string, properties: any) => {
            console.log('Amplitude Event:', event, properties);
          },
        };

        amplitude.track(AMPLITUDE_KPI_EVENTS.PROFILE_VIEWED, {
          viewed_profile_id: partner.id,
          view_source: 'matching_history',
          partner_age: partner.age,
          partner_university: partner.universityDetails?.name,
          timestamp: new Date().toISOString(),
        });
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [partner]);

  const onZoomClose = () => {
    setZoomVisible(false);
  };

  const handleMihoIntroClose = () => {
    setShowMihoIntro(false);
  };

  const userWithdrawal = !!partner?.deletedAt;

  if (isLoading || !partner) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  const characteristicsOptions = parser.getMultipleCharacteristicsOptions(
    [
      t("apps.partner.view.profile_personality_type"),
      t("apps.partner.view.profile_love_style"),
      t("apps.partner.view.profile_interest"),
    ],
    partner.characteristics
  );

  const personal = characteristicsOptions["성격"];
  const loveStyles = characteristicsOptions["연애 스타일"];

  const mainProfileImageUrl =
    partner.profileImages.find((img) => img.isMain)?.imageUrl ||
    partner.profileImages.find((img) => img.isMain)?.url ||
    partner.profileImages[0]?.imageUrl ||
    partner.profileImages[0]?.url;

  const renderBottomButtons = () => {
    return (
      <View
        style={{
          marginBottom: 36,
          height: 48,
          marginTop: 6,
          marginLeft: 16,
          marginRight: 16,
        }}
      >
        <Show
          when={
            isStatus(partner?.connectionId ?? "") === "OPEN" &&
            isStatus(partner?.connectionId ?? "") !== "IN_CHAT"
          }
        >
          <View
            style={{ width: "100%", flex: 1, flexDirection: "row", height: 48 }}
          >
            <LikedMeOpenButton
              height={48}
              matchId={matchId}
              likeId={partner?.matchLikeId ?? undefined}
            />
          </View>
        </Show>

        <Show
          when={
            !(isStatus(partner?.connectionId ?? "") === "OPEN") &&
            !isLiked(partner?.connectionId ?? "") &&
            !!partner?.connectionId &&
            !(isStatus(partner?.connectionId ?? "") === "IN_CHAT")
          }
        >
          <View
            style={{
              width: "100%",
              flex: 1,
              flexDirection: "row",
              height: 48,
            }}
          >
            <LikeButton connectionId={partner.connectionId ?? ""} />
          </View>
        </Show>
        <Show
          when={
            !isExpired(partner?.connectionId ?? "") &&
            isStatus(partner?.connectionId ?? "") === "PENDING"
          }
        >
          <View className="w-full flex flex-row">
            <Button
              variant="outline"
              disabled={true}
              size="md"
              className={cn("flex-1 items-center ", `!h-[${20}px]`)}
            >
              <Text>{t("apps.partner.view.button_waiting")}</Text>
            </Button>
          </View>
        </Show>
        <Show
          when={
            isExpired(partner?.connectionId ?? "") ||
            isStatus(partner?.connectionId ?? "") === "REJECTED" ||
            userWithdrawal
          }
        >
          <ILikedRejectedButton
            height={48}
            connectionId={partner?.connectionId ?? ""}
          />
        </Show>
        <Show when={isStatus(partner?.connectionId ?? "") === "IN_CHAT"}>
          <InChatButton height={48} />
        </Show>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <MihoIntroModal visible={showMihoIntro} onClose={handleMihoIntroClose} />

      <PhotoSlider
        images={partner?.profileImages.map((item) => item.imageUrl || item.url) ?? []}
        onClose={onZoomClose}
        initialIndex={selectedIndex}
        visible={isZoomVisible}
      />

      <HeaderWithNotification
        rightContent={
          <Pressable
            onPress={() =>
              router.navigate({
                pathname: "/partner/ban-report",
                params: {
                  partnerId: partner.id,
                  partnerName: partner.name,
                  partnerAge: partner.age,
                  partnerUniv: partner.universityDetails.name,
                  partnerProfileImage: mainProfileImageUrl,
                },
              })
            }
            className="pt-2 -mr-2"
          >
            <Feather name="alert-triangle" size={24} color={semanticColors.text.primary} />
          </Pressable>
        }
      />

      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <MatchingAnalysis imageUrl={mainProfileImageUrl} />
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {partner.profileImages.length > 0 && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  overflow: "hidden",
                }}
              >
                <Pressable
                  onPress={() => {
                    setSelectedIndex(0);
                    setZoomVisible(true);
                  }}
                  className="w-full h-full"
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    source={{ uri: partner.profileImages[0].imageUrl || partner.profileImages[0].url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                </Pressable>

                <View
                  style={styles.profileOverlay}
                  pointerEvents="none"
                >
                  <View style={styles.lastLoginBadge}>
                    <Text style={styles.lastLoginLabel}>
                      마지막 접속
                    </Text>
                    <Text style={styles.lastLoginValue}>
                      {formatLastLogin(partner.updatedAt)}
                    </Text>
                  </View>
                  <Text style={styles.ageText}>
                    만 {partner.age}세
                  </Text>
                  <View style={styles.universityRow}>
                    {partner.universityDetails?.code && (
                      <Image
                        source={{
                          uri: getSmartUnivLogoUrl(
                            partner.universityDetails.code
                          ),
                        }}
                        style={styles.universityLogo}
                        contentFit="contain"
                      />
                    )}
                    <Text style={styles.universityName}>
                      {partner.universityDetails?.name}
                    </Text>
                  </View>
                  <View style={styles.verificationRow}>
                    <Feather
                      name="check-square"
                      size={16}
                      color={semanticColors.brand.accent}
                    />
                    <Text style={styles.verificationText}>
                      {partner.universityDetails?.authentication
                        ? "대학교 인증 완료"
                        : "대학교 인증 전"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <PartnerBasicInfo partner={partner} />

            {partner.profileImages.length > 1 && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  marginBottom: 32,
                  borderRadius: 32,
                  overflow: "hidden",
                }}
              >
                {myApprovedPhotosCount >= 2 ? (
                  <Pressable
                    onPress={() => {
                      setSelectedIndex(1);
                      setZoomVisible(true);
                    }}
                    className="w-full h-full"
                  >
                    <Image
                      source={{ uri: partner.profileImages[1].imageUrl || partner.profileImages[1].url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </Pressable>
                ) : (
                  <BlurredPhotoCard
                    skippedPhotoCount={partner.profileImages.length - myApprovedPhotosCount}
                    showCTA={true}
                    size="full"
                    sampleImageUrl={mainProfileImageUrl}
                  />
                )}
              </View>
            )}

            <PartnerMBTI partner={partner} />

            <Text
              style={{
                color: semanticColors.text.primary,
                fontSize: 18,
                fontWeight: 'bold',
                paddingHorizontal: 20,
                marginBottom: 4,
              }}
            >
              미호가 두분을 연결한 특별한 이유
            </Text>

            {matchReasonsData?.reasons && matchReasonsData.reasons.length > 0 && (
              <MatchingReasonCard
                reasons={matchReasonsData.reasons.map((r) => r.description)}
                keywords={[
                  ...(parser.getMultipleCharacteristicsOptions(["성격"], partner.characteristics)["성격"]?.map((c: any) => c.label) || []),
                  ...(parser.getMultipleCharacteristicsOptions(["연애 스타일"], partner.characteristics)["연애 스타일"]?.map((c: any) => c.label) || []),
                  ...(parser.getMultipleCharacteristicsOptions(["관심사"], partner.characteristics)["관심사"]?.map((c: any) => c.label) || []),
                ]}
              />
            )}

            {partner.profileImages.length > 2 && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  marginBottom: 32,
                  borderRadius: 32,
                  overflow: "hidden",
                }}
              >
                {myApprovedPhotosCount >= 3 ? (
                  <Pressable
                    onPress={() => {
                      setSelectedIndex(2);
                      setZoomVisible(true);
                    }}
                    className="w-full h-full"
                  >
                    <Image
                      source={{ uri: partner.profileImages[2].imageUrl || partner.profileImages[2].url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </Pressable>
                ) : (
                  <BlurredPhotoCard
                    skippedPhotoCount={partner.profileImages.length - myApprovedPhotosCount}
                    showCTA={myApprovedPhotosCount === 2}
                    size="full"
                    sampleImageUrl={mainProfileImageUrl}
                  />
                )}
              </View>
            )}

            {partner.profileImages.length > 3 && (
              <View className="pb-10">
                {partner.profileImages.slice(3).map((item, index) => (
                  <View
                    key={item.id}
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 32,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    {myApprovedPhotosCount >= (index + 4) ? (
                      <Pressable
                        onPress={() => {
                          setSelectedIndex(index + 3);
                          setZoomVisible(true);
                        }}
                        className="w-full h-full"
                      >
                        <Image
                          source={{ uri: item.imageUrl || item.url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      </Pressable>
                    ) : (
                      <BlurredPhotoCard
                        skippedPhotoCount={partner.profileImages.length - myApprovedPhotosCount}
                        showCTA={myApprovedPhotosCount === (index + 3)}
                        size="full"
                        sampleImageUrl={mainProfileImageUrl}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Bar */}
          {renderBottomButtons()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  lastLoginBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: semanticColors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  lastLoginLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: semanticColors.text.inverse,
  },
  lastLoginValue: {
    fontSize: 12,
    fontWeight: '300',
    color: semanticColors.text.inverse,
  },
  ageText: {
    fontSize: 30,
    fontWeight: '700',
    color: semanticColors.text.inverse,
    marginBottom: 4,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  universityLogo: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  universityName: {
    fontSize: 16,
    color: semanticColors.text.inverse,
    opacity: 0.9,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    color: semanticColors.brand.accent,
    marginLeft: 4,
  },
  sectionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: semanticColors.text.primary,
    marginBottom: 12,
    lineHeight: 26,
  },
  sectionContent: {
    fontSize: 15,
    color: semanticColors.text.secondary,
    lineHeight: 24,
  },
});
