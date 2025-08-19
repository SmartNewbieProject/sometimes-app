import { useModal } from "@/src/shared/hooks/use-modal";
import { cn, dayUtils, tryCatch } from "@/src/shared/libs";
import { Button, Show } from "@/src/shared/ui";
import {
  getRemainingTimeFormatted,
  getRemainingTimeLimit,
} from "@/src/shared/utils/like";
import ChatIcon from "@assets/icons/chat.svg";
import XIcon from "@assets/icons/x-icon.svg";
import { Text as CustomText } from "@shared/ui/text";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { openInstagram } from "../../instagram/services";
import { LikeButton } from "../../like/ui/like-button";
import { useFeatureCost } from "../../payment/hooks";
import useByeLike from "../queries/useByeLike";
import useRejectLike from "../queries/useRejectLike";

interface PostBoxCardProps {
  status: string;
  likedAt: string;
  instagram: string | null;
  mainProfileUrl: string;
  nickname: string;
  matchId: string;
  universityName: string;
  age: number;
  viewedAt: string | null;
  matchExpiredAt: string;
  isExpired: boolean;
  connectionId: string;
  isMutualLike: boolean;
  deletedAt: string | null;
  type: "liked-me" | "i-liked";
}

function PostBoxCard({
  status,
  likedAt,
  instagram,
  mainProfileUrl,
  nickname,
  age,
  matchId,
  connectionId,
  viewedAt,
  isExpired,
  matchExpiredAt,
  universityName,
  isMutualLike,
  deletedAt,
  type,
}: PostBoxCardProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const statusMessage =
    type === "liked-me"
      ? `${dayUtils.formatRelativeTime(likedAt)} 좋아요를 눌렀어요`
      : status === "OPEN"
      ? "서로 좋아요를 눌렀어요!"
      : status === "REJECTED"
      ? "상대방이 거절했어요"
      : "상대방의 응답을 기다리고 있어요";
  const userWithdrawal = !!deletedAt;

  const renderBottomButton = isExpired ? (
    <ILikedRejectedButton connectionId={connectionId} />
  ) : status === "OPEN" && instagram ? (
    <LikedMeOpenButton instagramId={instagram} />
  ) : type === "liked-me" ? (
    <LikedMePendingButton connectionId={connectionId} />
  ) : type === "i-liked" && status === "REJECTED" ? (
    <ILikedRejectedButton connectionId={connectionId} />
  ) : (
    <></>
  );

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();

    return () => anim.stop();
  }, [opacity]);

  return (
    <Pressable
      onPress={() => {
        if (userWithdrawal) return;
        router.push(`/partner/view/${matchId}`);
      }}
    >
      <View style={styles.container}>
        <View style={[styles.viewPoint, !viewedAt && styles.viewYet]} />
        <Image source={mainProfileUrl} style={styles.profileImage} />
        <View style={styles.contentContainer}>
          <View style={styles.topText}>
            <Text style={styles.name} className="font-medium">
              {nickname}
            </Text>
            <Text style={styles.age}>만 {age}세</Text>
          </View>
          <Text style={styles.university}>{universityName}</Text>
          <Text
            style={[
              styles.status,
              styles.pending,
              type === "i-liked" && status === "REJECTED" && styles.reject,
              type === "i-liked" && status === "OPEN" && styles.open,
            ]}
          >
            {statusMessage}
          </Text>
          <Animated.Text
            style={[
              styles.status,
              styles.timeText,
              getRemainingTimeLimit(matchExpiredAt) && {
                color: "#EF4444",
                opacity,
              },
            ]}
          >
            {getRemainingTimeFormatted(matchExpiredAt)}
          </Animated.Text>

          <Show when={userWithdrawal}>
            <CustomText textColor="gray" size="13" weight="light">
              서비스를 탈퇴한 유저에요
            </CustomText>
          </Show>
          <Show when={!userWithdrawal}>{renderBottomButton}</Show>
        </View>
      </View>
    </Pressable>
  );
}

export function LikedMePendingButton({
  connectionId,
}: {
  connectionId: string;
}) {
  const mutation = useRejectLike();
  const handleReject = () => {
    tryCatch(
      async () => {
        await mutation.mutateAsync(connectionId);
      },
      (error) => {
        console.log("error", error);
      }
    );
  };
  return (
    <View className="w-full flex flex-row  gap-x-[10px]">
      <Button
        onPress={handleReject}
        variant="outline"
        className="flex-1 items-center !h-[40px]"
        prefix={<XIcon width={21} height={21} />}
      >
        괜찮아요
      </Button>

      <LikeButton clasName="!h-[40px]" connectionId={connectionId} />
    </View>
  );
}

export function LikedMeOpenButton({
  instagramId,
  height = 40,
}: {
  instagramId: string;
  height?: number;
}) {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const handleStartInstagram = () => {
    showModal({
      showLogo: true,

      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <CustomText textColor="black" weight="bold" size="20">
            마음에 드는 이성과
          </CustomText>
          <CustomText textColor="black" weight="bold" size="20">
            대화를 시작해볼까요?
          </CustomText>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px] !h-[40px]">
          <Text className="text-[#AEAEAE] text-[12px]">인스타그램을 통해</Text>
          <Text className="text-[#AEAEAE] text-[12px]">
            자연스럽게 대화를 시작해보세요
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: () => openInstagram(instagramId),
      },
      secondaryButton: {
        text: "아니요",
        onClick: hideModal,
      },
    });
  };
  return (
    <View className="w-full flex flex-row">
      <Button
        onPress={handleStartInstagram}
        variant="primary"
        size="md"
        className={cn("flex-1 items-center ", `!h-[${height}px]`)}
        prefix={<ChatIcon width={20} height={20} />}
      >
        대화 시작하기
      </Button>
    </View>
  );
}

export function ILikedRejectedButton({
  connectionId,
  height = 40,
}: {
  connectionId: string;
  height?: number;
}) {
  const { showModal, hideModal } = useModal();
  const mutation = useByeLike();
  const handleBye = () => {
    showModal({
      showLogo: true,

      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <CustomText textColor="black" weight="bold" size="20">
            이번엔 인연이 닿지 않았어요
          </CustomText>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px] !h-[40px]">
          <Text className="text-[#AEAEAE] text-[12px]">
            괜찮아요 더 멋진 만남이 곧 찾아올 거예요.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "확인",
        onClick: async () => {
          await mutation.mutateAsync(connectionId);
        },
      },
      secondaryButton: {
        text: "닫기",
        onClick: hideModal,
      },
    });
  };
  return (
    <View className="w-full flex flex-row">
      <Button
        onPress={handleBye}
        variant="outline"
        size="md"
        className={cn("flex-1 items-center ", `!h-[${height}px]`)}
        prefix={<XIcon width={21} height={21} />}
      >
        인연이 아니었나봐요
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    paddingTop: 16,
    paddingBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    borderColor: "#E1D9FF",
    paddingLeft: 12,
    paddingRight: 16,
    flexDirection: "row",
    gap: 8,
  },
  profileImage: {
    width: 68,
    height: 68,
    borderRadius: 68,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
    lineHeight: 14,
    marginTop: 2,
    fontWeight: "500",
  },
  viewPoint: {
    width: 12,
    height: 12,
    borderRadius: 9999,
    backgroundColor: "#F3EDFF",
    position: "absolute",
    right: 13,
    top: 13,
  },
  viewYet: {
    backgroundColor: "#7A4AE2",
  },
  contentContainer: {
    flex: 1,
  },
  topText: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    lineHeight: 24,
    color: "#111827",
  },
  age: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  university: {
    fontSize: 16,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 6,
  },
  status: {
    lineHeight: 16,
    marginBottom: 5,
  },
  pending: {
    fontSize: 12,
    color: "#6B7280",
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    color: "#BEACFF",
    marginLeft: -6,
    marginRight: 5,
  },
  reject: {
    fontSize: 12,
    color: "#6B7280",
  },
  open: {
    color: "#8638E5",
    fontSize: 13,
  },
});

export default PostBoxCard;
