import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import Instagram from "@/src/features/instagram";
import useLiked from "@/src/features/like/hooks/use-liked";
import { LikeButton } from "@/src/features/like/ui/like-button";
import {
  ILikedRejectedButton,
  InChatButton,
  LikedMeOpenButton,
} from "@/src/features/post-box/ui/post-box-card";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ChipSelector } from "@/src/widgets";
import PhotoSlider from "@/src/widgets/slide/photo-slider";
import Loading from "@features/loading";
import Match from "@features/match";
import { useCarousel } from "@shared/hooks/use-carousel";
import {
  ImageResources,
  axiosClient,
  cn,
  parser,
  tryCatch,
  formatLastLogin,
  getSmartUnivLogoUrl,
} from "@shared/libs";

// Feather 아이콘 임포트
import Feather from "@expo/vector-icons/Feather";
import {
  Button,
  Header,
  ImageResource,
  PalePurpleGradient,
  Section,
  Show,
  Text,
  HeaderWithNotification,
} from "@shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpStatusCode } from "axios";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/src/features/auth";
import { useFeatureCost } from "@/src/features/payment/hooks";
import { semanticColors } from "@/src/shared/constants/colors";

const { queries, ui } = Match;
const {
  ui: { InstagramContactButton },
} = Instagram;
const { useMatchPartnerQuery } = queries;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
  const [isZoomVisible, setZoomVisible] = useState(false);
  const { isStatus, isLiked, isExpired } = useLiked();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { profileDetails } = useAuth();
  const { showModal, hideModal, showErrorModal } = useModal();
  const { featureCosts } = useFeatureCost();

  const onZoomClose = () => {
    setZoomVisible(false);
  };

  const userWithdrawal = !!partner?.deletedAt;

  const loading = (() => {
    if (!partner) return true;
    if (isLoading) return true;
    return false;
  })();

  const characteristicsOptions = parser.getMultipleCharacteristicsOptions(
    ["성격 유형", "연애 스타일", "관심사"],
    partner?.characteristics ?? []
  );

  const personal = characteristicsOptions["성격 유형"];
  const loveStyles = characteristicsOptions["연애 스타일"];
  const interests = characteristicsOptions.관심사;

  if (loading || !partner) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  const mainProfileImageUrl = partner.profileImages.find(
    (img) => img.isMain
  )?.url;

  // Basic Info Data
  const basicInfo = [
    {
      icon: ImageResources.BEER,
      label: parser.getSingleOption("음주 선호도", partner.characteristics) ?? "정보 없음",
    },
    {
      icon: ImageResources.SMOKE,
      label: parser.getSingleOption("흡연 선호도", partner.characteristics) ?? "정보 없음",
    },
    {
      icon: ImageResources.TATOO,
      label: parser.getSingleOption("문신 선호도", partner.characteristics) ?? "정보 없음",
    },
    {
      icon: ImageResources.AGE,
      label: parser.getSingleOption("선호 나이대", partner.preferences) ?? "상관없음",
    },
  ];

  // Button Handlers - Reverted to original logic
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
      <PhotoSlider
        images={partner?.profileImages.map((item) => item.url) ?? []}
        onClose={onZoomClose}
        initialIndex={selectedIndex}
        visible={isZoomVisible}
      />

      {/* Header with Back Button and Report Button */}
      <View className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-4 pt-[50px]">
        <Pressable onPress={() => router.push("/home")} className="p-2">
          <Feather name="chevron-left" size={28} color={semanticColors.text.inverse} />
        </Pressable>
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
          className="p-2"
        >
          <Feather name="alert-triangle" size={24} color={semanticColors.text.inverse} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image 1 (Main) */}
        {partner.profileImages.length > 0 && (
          <View style={{ width: "100%", aspectRatio: 1 }}>
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

            {/* Overlay Info */}
            <View className="absolute bottom-8 left-5 right-5" pointerEvents="none">
              <View style={{ backgroundColor: semanticColors.brand.primary }} className="self-start px-2 py-1 rounded-md mb-2 flex-row items-center gap-1">
                <Text style={{ color: semanticColors.text.inverse }} className="text-xs font-bold">마지막 접속</Text>
                <Text style={{ color: semanticColors.text.inverse }} className="text-xs font-light">{formatLastLogin(partner?.updatedAt)}</Text>
              </View>
              <Text style={{ color: semanticColors.text.inverse }} className="text-3xl font-bold mb-1">
                {partner.name || "알 수 없음"}, 만 {partner.age}
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

        <View className="px-5 py-6">
          {/* Basic Info Section */}
          <Text style={{ color: semanticColors.text.muted }} className="text-sm mb-4">기본 정보</Text>
          <View style={{ backgroundColor: semanticColors.surface.surface }} className="rounded-2xl p-5 flex-row flex-wrap justify-between">
            {basicInfo.map((info, index) => (
              <View key={index} className="w-[48%] flex-row items-center mb-4">
                <ImageResource resource={info.icon} width={24} height={24} />
                <Text style={{ color: semanticColors.text.secondary }} className="ml-2 font-medium text-sm flex-1" numberOfLines={1}>
                  {info.label}
                </Text>
              </View>
            ))}
          </View>

          {/* MBTI Section */}
          <View className="w-full aspect-[280/160] mt-8 mb-8">
            <ImageResource
              resource={ImageResources[partner.mbti as keyof typeof ImageResources]}
              width="100%"
              height="100%"
            />
          </View>

          {/* Dating Style */}
          <Text style={{ color: semanticColors.text.muted }} className="text-sm mt-8 mb-3">제 연애 스타일은</Text>
          <View className="flex-row flex-wrap gap-2">
            {loveStyles.map((style, index) => (
              <View key={index} style={{ borderColor: semanticColors.brand.primary }} className="border rounded-full px-4 py-2">
                <Text style={{ color: semanticColors.brand.primary }} className="text-sm">{style.label}</Text>
              </View>
            ))}
          </View>

          {/* Personality */}
          <Text style={{ color: semanticColors.text.muted }} className="text-sm mt-8 mb-3">제 성격은</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {personal.map((item, index) => (
              <View key={index} style={{ borderColor: semanticColors.brand.primary }} className="border rounded-full px-4 py-2">
                <Text style={{ color: semanticColors.brand.primary }} className="text-sm">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Image 2 */}
        {partner.profileImages.length > 1 && (
          <View style={{ width: "100%", aspectRatio: 1, marginBottom: 32 }}>
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

        <View className="px-5 pb-6">
          {/* Interests */}
          <Text style={{ color: semanticColors.text.muted }} className="text-sm mb-3">제 관심사는</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {interests.map((item, index) => (
              <View key={index} style={{ borderColor: semanticColors.brand.primary }} className="border rounded-full px-4 py-2 flex-row items-center">
                <Text style={{ color: semanticColors.brand.primary }} className="text-sm">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Image 3 and others */}
        {partner.profileImages.length > 2 && (
          <View className="pb-10">
            {partner.profileImages.slice(2).map((item, index) => (
              <View key={item.id} style={{ width: "100%", aspectRatio: 1, marginBottom: 16 }}>
                <Pressable
                  onPress={() => {
                    setSelectedIndex(index + 2);
                    setZoomVisible(true);
                  }}
                  className="w-full h-full"
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {renderBottomButtons()}
    </View>
  );
}

const styles = StyleSheet.create({});
