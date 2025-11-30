import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from '@/src/shared/constants/colors';
import { dayUtils, tryCatch } from "@/src/shared/libs";
import { Button, Show } from "@/src/shared/ui";
import {
  getRemainingTimeFormatted,
  getRemainingTimeLimit,
} from "@/src/shared/utils/like";
import type { UserProfile } from "@/src/types/user";
import ChatIcon from "@assets/icons/chat.svg";
import XIcon from "@assets/icons/x-icon.svg";
import { Text as CustomText } from "@shared/ui/text";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";
import useCreateChatRoom from "../../chat/queries/use-create-chat-room";
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
  likeId?: string;
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
  likeId,
}: PostBoxCardProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const statusMessage =
    type === "liked-me"
      ? `${dayUtils.formatRelativeTime(likedAt)} 좋아요를 눌렀어요`
      : status === "OPEN"
      ? "서로 좋아요를 눌렀어요!"
      : status === "REJECTED"
      ? "상대방이 거절했어요"
      : status === "IN_CHAT"
      ? "상대방과 대화중이에요"
      : "상대방의 응답을 기다리고 있어요";
  const userWithdrawal = !!deletedAt;

  const renderBottomButton =
    (type === "i-liked" && status === "REJECTED") || userWithdrawal ? (
      <ILikedRejectedButton connectionId={connectionId} />
    ) : status === "IN_CHAT" ? (
      <InChatButton />
    ) : isExpired ? (
      <ILikedRejectedButton connectionId={connectionId} />
    ) : status === "OPEN" && instagram ? (
      <LikedMeOpenButton matchId={matchId} likeId={likeId} />
    ) : type === "liked-me" ? (
      <LikedMePendingButton connectionId={connectionId} />
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
        if (userWithdrawal || isExpired) return;
        router.push(`/partner/view/${matchId}`);
      }}
    >
      <View style={styles.container}>
        <View style={[styles.viewPoint, !viewedAt && styles.viewYet]} />
        <Image source={mainProfileUrl} style={styles.profileImage} />
        <View style={styles.contentContainer}>
          <View style={styles.topText}>
            <Text style={[styles.name, { fontWeight: '500' }]}>
              {nickname}
            </Text>
            <Text style={styles.age}>만 {age}세</Text>
          </View>
          <Text style={styles.university}>{universityName}</Text>
          <Show when={!userWithdrawal}>
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
          </Show>

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
            {status === "IN_CHAT"
              ? ""
              : getRemainingTimeFormatted(matchExpiredAt, isExpired)}
          </Animated.Text>

          {renderBottomButton}
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
    <View style={buttonStyles.pendingContainer}>
      <Button
        onPress={handleReject}
        variant="outline"
        style={buttonStyles.pendingButton}
        prefix={<XIcon width={21} height={21} />}
      >
        괜찮아요
      </Button>

      <LikeButton style={buttonStyles.likeButton} connectionId={connectionId} />
    </View>
  );
}

export function LikedMeOpenButton({
  matchId,
  likeId,
  height = 40,
}: {
  matchId: string;
  likeId?: string;
  height?: number;
}) {
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { my } = useAuth();
  const mutation = useCreateChatRoom();
  const { profileDetails } = useAuth();

  const handleCreateChat = () => {
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
        <View style={buttonStyles.modalContent}>
          <Text style={buttonStyles.modalText}>
            {profileDetails?.gender === "MALE"
              ? `구슬 ${featureCosts?.CHAT_START}개로`
              : "지금 바로"}
            로 채팅방을 열 수 있어요.
          </Text>
          <Text style={buttonStyles.modalText}>
            지금 바로 첫 메시지를 보내보세요!
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: () => {
          mutation.mutateAsync({ matchId, matchLikeId: likeId });
        },
      },
      secondaryButton: {
        text: "아니요",
        onClick: hideModal,
      },
    });
  };
  return (
    <View style={buttonStyles.buttonContainer}>
      <Button
        onPress={handleCreateChat}
        variant="primary"
        size="md"
        style={[buttonStyles.chatButton, { height: height }]}
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
        <View style={buttonStyles.modalContent}>
          <Text style={buttonStyles.modalText}>
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
    <View style={buttonStyles.buttonContainer}>
      <Button
        onPress={handleBye}
        variant="outline"
        size="md"
        style={[buttonStyles.outlineButton, { height: height }]}
        prefix={<XIcon width={21} height={21} />}
      >
        인연이 아니었나봐요
      </Button>
    </View>
  );
}

export function InChatButton({ height = 40 }: { height?: number }) {
  const router = useRouter();
  const handleCreateChat = () => {
    router.push("/chat");
  };
  return (
    <View style={buttonStyles.buttonContainer}>
      <Button
        onPress={handleCreateChat}
        variant="primary"
        size="md"
        style={[buttonStyles.chatButton, { height: height }]}
        prefix={<ChatIcon width={20} height={20} />}
      >
        대화가 이어지고 있어요
      </Button>
    </View>
  );
}

const buttonStyles = StyleSheet.create({
  pendingContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  pendingButton: {
    flex: 1,
    alignItems: "center",
    height: 40,
  },
  likeButton: {
    height: 40,
  },
  modalContent: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    minHeight: 40,
  },
  modalText: {
    color: semanticColors.text.disabled,
    fontSize: 12,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
  },
  chatButton: {
    flex: 1,
    alignItems: "center",
  },
  outlineButton: {
    flex: 1,
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    paddingTop: 16,
    paddingBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    borderColor: semanticColors.border.default,
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
    color: semanticColors.text.disabled,
    lineHeight: 14,
    marginTop: 2,
    fontWeight: "500",
  },
  viewPoint: {
    width: 12,
    height: 12,
    borderRadius: 9999,
    backgroundColor: semanticColors.surface.background,
    position: "absolute",
    right: 13,
    top: 13,
  },
  viewYet: {
    backgroundColor: semanticColors.brand.primary,
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
    color: semanticColors.text.secondary,
  },
  age: {
    fontSize: 14,
    lineHeight: 20,
    color: semanticColors.text.muted,
  },
  university: {
    fontSize: 16,
    lineHeight: 20,
    color: semanticColors.text.muted,
    marginBottom: 6,
  },
  status: {
    lineHeight: 16,
    marginBottom: 5,
  },
  pending: {
    fontSize: 12,
    color: semanticColors.text.muted,
  },
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    color: semanticColors.brand.accent,
    marginLeft: -6,
    marginRight: 5,
  },
  reject: {
    fontSize: 12,
    color: semanticColors.text.muted,
  },
  open: {
    color: semanticColors.brand.primary,
    fontSize: 13,
  },
});

export default PostBoxCard;
