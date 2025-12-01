import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from '../../../shared/constants/colors';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";
import { useFeatureCost } from "../../payment/hooks";
import useChatRockQuery from "../queries/use-chat-lock-query";
import useLeaveChatRoom from "../queries/use-leave-chat-room";

function useChatLock(chatRoomId: string) {
  const { showModal } = useModal();
  const { profileDetails } = useAuth();
  const { featureCosts } = useFeatureCost();
  const { mutate: enterMutate } = useChatRockQuery(chatRoomId);
  const { mutate: leaveMutate } = useLeaveChatRoom();

  const handleUnlock = () => {
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
          <Text style={styles.modalTitleText}>채팅을 열어</Text>
          <Text style={styles.modalTitleText}>대화를 이어나가볼까요?</Text>
        </View>
      ),

      children: (
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalContentText}>
            {profileDetails?.gender === "MALE"
              ? `구슬 ${featureCosts?.CHAT_START}개로`
              : "지금 바로"}
            채팅방을 열 수 있어요
          </Text>
          <Text style={styles.modalContentText}>
            지금 답잡을 보내 설레는 대화를 시작해보세요!
          </Text>
        </View>
      ),
      primaryButton: {
        text: "네, 해볼래요",
        onClick: () => enterMutate(),
      },
      secondaryButton: {
        text: "아니요",
        onClick: () => {},
      },
    });
  };

  const handleRemove = () => {
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
          <Text style={styles.modalTitleText}>채팅 요청을</Text>
          <Text style={styles.modalTitleText}>삭제하시겠어요?</Text>
        </View>
      ),
      children: (
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalContentText}>
            삭제하면 이 요청은 다시 확인할 수 없어요
          </Text>
          <Text style={styles.modalContentText}>정말 삭제하시겠어요?</Text>
        </View>
      ),
      primaryButton: {
        text: "취소",
        onClick: () => {},
      },
      secondaryButton: {
        text: "삭제",
        onClick: () => leaveMutate({ chatRoomId }),
      },
      reverse: true,
    });
  };

  return {
    handleUnlock,
    handleRemove,
  };
}

const styles = StyleSheet.create({
  modalContentContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    height: 40,
  },
  modalContentText: {
    color: semanticColors.text.disabled,
    fontSize: 12,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "Pretendard-Bold",
    lineHeight: 24,
  },
});

export default useChatLock;
