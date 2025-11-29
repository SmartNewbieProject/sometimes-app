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
import { MihoIntroModal } from "@/src/features/match/ui";
import {
  cn,
  formatLastLogin,
  getSmartUnivLogoUrl,
} from "@shared/libs";
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
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text as RNText,
} from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";

const { queries } = Match;
const { useMatchPartnerQuery } = queries;

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
  const [isZoomVisible, setZoomVisible] = useState(false);
  const { isStatus, isLiked, isExpired } = useLiked();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMihoIntro, setShowMihoIntro] = useState(true);

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

  const mainProfileImageUrl = partner.profileImages.find(
    (img) => img.isMain
  )?.url;

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
              <Text>상대방 응답을 기다리는 중..</Text>
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
    <View className="flex-1" style={{ backgroundColor: semanticColors.surface.background }}>
      <MihoIntroModal visible={showMihoIntro} onClose={handleMihoIntroClose} />

      <PhotoSlider
        images={partner?.profileImages.map((item) => item.url) ?? []}
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {partner.profileImages.length > 0 && (
          <View style={{ width: "100%", aspectRatio: 1,  overflow: "hidden" }}>
            <Pressable
              onPress={() => {
                setSelectedIndex(0);
                setZoomVisible(true);
              }}
              className="w-full h-full"
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                source={{ uri: partner.profileImages[0].url }}
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

            <View className="absolute bottom-8 left-5 right-5" pointerEvents="none">
              <View style={{ backgroundColor: semanticColors.brand.primary }} className="self-start px-2 py-1 rounded-md mb-2 flex-row items-center gap-1">
                <Text style={{ color: semanticColors.text.inverse }} className="text-xs font-bold">마지막 접속</Text>
                <Text style={{ color: semanticColors.text.inverse }} className="text-xs font-light">{formatLastLogin(partner.updatedAt)}</Text>
              </View>
              <Text style={{ color: semanticColors.text.inverse }} className="text-3xl font-bold mb-1">
                만 {partner.age}세
              </Text>
              <View className="flex-row items-center mb-1">
                {partner.universityDetails?.code && (
                  <Image
                    source={{ uri: getSmartUnivLogoUrl(partner.universityDetails.code) }}
                    style={{ width: 20, height: 20, marginRight: 6 }}
                    contentFit="contain"
                  />
                )}
                <Text style={{ color: semanticColors.text.inverse }} className="text-base opacity-90">
                  {partner.universityDetails?.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="check-square" size={16} color={semanticColors.brand.accent} />
                <Text style={{ color: semanticColors.brand.accent }} className="ml-1 text-sm">
                  {partner.universityDetails?.authentication ? "대학교 인증 완료" : "대학교 인증 전"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <RNText style={styles.sectionTitle}>침묵조차 어색하지 않을, 잔잔한 파동의 만남</RNText>
          <RNText style={styles.sectionContent}>
            두 분 다 왁자지껄한 모임보다는, 소수의 사람과 깊은 이야기를 나누는 걸 편안해하시는 성향이세요. 상대방은 섬세하고 속 깊은 감성(INFJ)을, 재윤 님은 차분하면서도 통찰력 있는 모습(INTJ)을 가지고 계시죠.{'\n\n'}억지로 텐션을 높이려 애쓰지 않아도 돼요. 분위기 좋은 카페에 마주 앉아 각자의 이야기를 조곤조곤 나누다 보면, "이 사람과는 굳이 말하지 않아도 마음이 통한다"는 편안함을 느끼실 거예요. 서로의 고요함을 지루해하지 않고 오히려 아껴줄 수 있는, 결이 아주 비슷한 두 분입니다.
          </RNText>
        </View>

        {/* Image 2 */}
        {partner.profileImages.length > 1 && (
          <View style={{ width: "100%", aspectRatio: 1, borderRadius: 32, overflow: "hidden" }}>
            <Pressable
              onPress={() => {
                setSelectedIndex(1);
                setZoomVisible(true);
              }}
              className="w-full h-full"
            >
              <Image
                source={{ uri: partner.profileImages[1].url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Pressable>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <RNText style={styles.sectionTitle}>서로의 '싫음'을 건드리지 않는 평화로운 관계</RNText>
          <RNText style={styles.sectionContent}>
            연애하다 보면 사소한 습관 때문에 부딪히는 경우가 참 많잖아요? 그런데 두 분은 그런 불필요한 감정 소모가 전혀 없을 조합입니다.{'\n\n'}두 분 다 담배 연기를 싫어하시고, 술도 분위기를 즐길 정도로만 딱 깔끔하게 마시는 걸 선호하시죠. 자극적이거나 화려한 겉모습보다는, 단정하고 깔끔한 본연의 모습을 서로 지향하고 계세요. 서로의 라이프스타일이 워낙 닮아 있어서, 만나는 내내 거슬림 없이 물 흐르듯 편안한 데이트가 이어질 겁니다.
          </RNText>
        </View>

        {/* Image 3 */}
        {partner.profileImages.length > 2 && (
          <View style={{ width: "100%", aspectRatio: 1, borderRadius: 32, overflow: "hidden" }}>
            <Pressable
              onPress={() => {
                setSelectedIndex(2);
                setZoomVisible(true);
              }}
              className="w-full h-full"
            >
              <Image
                source={{ uri: partner.profileImages[2].url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </Pressable>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <RNText style={styles.sectionTitle}>듬직한 '복학생 오빠'와 사랑스러운 '새내기'의 케미</RNText>
          <RNText style={styles.sectionContent}>
            재윤 님은 군 복무를 마친 3학년, 상대방은 이제 막 대학 생활을 시작한 1학년이시네요. 재윤 님은 '연하'를 선호하시고, 상대방은 기댈 수 있는 '배려심 깊고 다정한 사람'을 찾으셨죠.{'\n\n'}상상이 되시나요? 요리와 사진, 패션에 관심 많은 센스 있는 재윤 님이 예쁜 카페를 찾아 상대방을 리드해주고, 윤주 님은 그런 재윤 님의 다정함 속에서 편안하게 의지하는 그림이요. 서로가 바라는 이상적인 연애의 모습(리드하는 다정함 & 따뜻한 호응)을 각자가 가지고 있어, 시작부터 설렘 가득한 캠퍼스 커플의 느낌이 물씬 납니다.
          </RNText>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {renderBottomButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
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
