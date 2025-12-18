import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { dayUtils, tryCatch } from "@/src/shared/libs";
import { Button, Show } from "@/src/shared/ui";
import {
  getRemainingTimeFormatted,
  getRemainingTimeLimit,
} from "@/src/shared/utils/like";
import type { UserProfile } from "@/src/types/user";
import ChatIcon from "@assets/icons/chat.svg";
import XIcon from "@assets/icons/x-icon.svg";
import FillHeartIcon from "@assets/icons/fill-heart.svg";
import { Text as CustomText } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../auth";
import useCreateChatRoom from "../../chat/queries/use-create-chat-room";
import { useTranslation } from "react-i18next";
import { openInstagram } from "../../instagram/services";
import useLike from "../../like/hooks/use-like";
import { useFeatureCost } from "../../payment/hooks";
import useByeLike from "../queries/useByeLike";
import useRejectLike from "../queries/useRejectLike";
import i18n from "@/src/shared/libs/i18n";


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
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(1)).current;
  const statusMessage =
    type === "liked-me"
      ? t("features.post-box.ui.card.status_messages.liked_me_relative", { time: dayUtils.formatRelativeTime(likedAt) })
      : status === "OPEN"
      ? t("features.post-box.ui.card.status_messages.mutual_like")
      : status === "REJECTED"
      ? t("features.post-box.ui.card.status_messages.rejected")
      : status === "IN_CHAT"
      ? "상대방과 대화중이에요"
      : t("features.post-box.ui.card.status_messages.waiting_response");
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
            <Text style={styles.name}>
              {nickname}
            </Text>
            <Text style={styles.age}>{t("features.post-box.apps.post_box.age_display", { age })}</Text>
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
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { onLike } = useLike();
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

  const handleLike = () => {
    showModal({
      showLogo: true,
      customTitle: (
        <View style={styles.modalTitleContainer}>
          <CustomText textColor="black" weight="bold" size="20">
            {t("features.like.ui.like_button.modal.title_line1")}
          </CustomText>
          <CustomText textColor="black" weight="bold" size="20">
            {profileDetails?.gender === "MALE"
              ? t("features.like.ui.like_button.modal.title_line2_male", {
                  cost: featureCosts?.LIKE_MESSAGE,
                })
              : t("features.like.ui.like_button.modal.title_line2_default")}
          </CustomText>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <CustomText textColor="disabled" size="12">
            {t("features.like.ui.like_button.modal.body_line1")}
          </CustomText>
          <CustomText textColor="disabled" size="12">
            {t("features.like.ui.like_button.modal.body_line2")}
          </CustomText>
        </View>
      ),
      primaryButton: {
        text: t("features.like.ui.like_button.modal.primary_button"),
        onClick: async () => {
          await onLike(connectionId);
        },
      },
      secondaryButton: {
        text: t("global.no"),
        onClick: hideModal,
      },
    });
  };

  return (
    <View style={styles.buttonRow}>
      <Button
        onPress={handleReject}
        variant="outline"
        style={styles.actionButton}
        prefix={<XIcon width={21} height={21} />}
      >
        {t("features.post-box.ui.card.buttons.ok")}
      </Button>

      <Button
        onPress={handleLike}
        variant="primary"
        style={styles.actionButton}
        prefix={<FillHeartIcon width={18} height={18} color="#fff" />}
      >
        {t("features.like.ui.like_button.button_label")}
      </Button>
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
  const { t } = useTranslation();
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
            {t("features.post-box.ui.card.modal_texts.start_instagram_title_line1")}
          </CustomText>
          <CustomText textColor="black" weight="bold" size="20">
            {t("features.post-box.ui.card.modal_texts.start_instagram_title_line2")}
          </CustomText>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <CustomText textColor="disabled" size="12">
            {profileDetails?.gender === "MALE"
              ? `구슬 ${featureCosts?.CHAT_START}개로`
              : "지금 바로"}
            로 채팅방을 열 수 있어요.
          </CustomText>
          <CustomText textColor="disabled" size="12">
            지금 바로 첫 메시지를 보내보세요!
          </CustomText>
        </View>
      ),
      primaryButton: {
        text: t("features.post-box.ui.card.buttons.yes_try"),
        onClick: () => {
          mutation.mutateAsync({ matchId, matchLikeId: likeId });
        },
      },
      secondaryButton: {
        text: t("global.no"),
        onClick: hideModal,
      },
    });
  };
  return (
    <View style={styles.buttonContainer}>
      <Button
        onPress={handleCreateChat}
        variant="primary"
        size="md"
        width="full"
        style={[styles.chatButton, { height }]}
        prefix={<ChatIcon width={20} height={20} />}
      >
        {t("features.post-box.ui.card.buttons.start_chat")}
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
            {i18n.t("features.post-box.ui.card.modal_texts.bye_title")}
          </CustomText>
        </View>
      ),
      children: (
        <View style={styles.modalContent}>
          <CustomText textColor="disabled" size="12">
            {i18n.t("features.post-box.ui.card.modal_texts.bye_subline")}
          </CustomText>
        </View>
      ),
      primaryButton: {
        text: i18n.t("features.post-box.ui.card.buttons.confirm"),
        onClick: async () => {
          await mutation.mutateAsync(connectionId);
        },
      },
      secondaryButton: {
        text: i18n.t("features.post-box.ui.card.buttons.close"),
        onClick: hideModal,
      },
    });
  };
  return (
    <View style={styles.buttonContainer}>
      <Button
        onPress={handleBye}
        variant="outline"
        size="md"
        style={[styles.chatButton, { height }]}
        prefix={<XIcon width={21} height={21} />}
      >
        {i18n.t("features.post-box.ui.card.buttons.not_a_match")}
      </Button>
    </View>
  );
}

export function InChatButton({ height = 48 }: { height?: number }) {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(-1)).current;
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(translateX, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  const animatedStyle = {
    transform: [
      {
        translateX: translateX.interpolate({
          inputRange: [-1, 1],
          outputRange: [-containerW, containerW],
        }),
      },
    ],
  };

  const handleCreateChat = () => {
    router.push("/chat");
  };

  return (
    <Pressable
      onPress={handleCreateChat}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width || 0)}
      style={[styles.glowingButtonContainer, { height }]}
    >
      <LinearGradient
        colors={["#9B6DFF", "#7A4AE2", "#6B3FD4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowingButtonGradient}
      >
        <ChatIcon width={20} height={20} />
        <Text style={styles.glowingButtonText}>대화가 이어지고 있어요</Text>
      </LinearGradient>
      <Animated.View style={[styles.glowOverlay, animatedStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0.15)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.15)",
            "rgba(255,255,255,0.05)",
            "transparent",
          ]}
          locations={[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Pressable>
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
    fontWeight: "500",
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
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    height: 40,
  },
  modalTitleContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  modalContent: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
  },
  chatButton: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  glowingButtonContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  glowingButtonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  glowingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    color: "#FFFFFF",
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
  },
});

export default PostBoxCard;
