import colors from "@/src/shared/constants/colors";
import { useModal } from "@/src/shared/hooks/use-modal";
import { cn } from "@/src/shared/libs";
import { Text as CustomText } from "@/src/shared/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLeaveChatRoom from "../queries/use-leave-chat-room";

interface ChatMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatMenuModal = ({ visible, onClose }: ChatMenuModalProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { showModal, hideModal } = useModal();
  const mutate = useLeaveChatRoom();
  const handleOutChat = () => {
    onClose();
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
            채팅방을 나가시겠습니까?
          </CustomText>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[8px] !h-[40px]">
          <Text className="text-[#AEAEAE] text-[12px]">
            나가면 대화 내역과 목록에서 완전히 삭제되며,
          </Text>
          <Text className="text-[#AEAEAE] text-[12px]">
            복구가 불가능합니다.
          </Text>
        </View>
      ),
      primaryButton: {
        text: "취소",
        onClick: hideModal,
      },
      secondaryButton: {
        text: "나가기",
        onClick: () => {
          mutate.mutateAsync({ chatRoomId: id });
        },
      },
    });
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        <View style={[styles.modalContainer, { bottom: insets.bottom + 74 }]}>
          <TouchableOpacity
            onPress={() => {
              router.push("/partner/ban-report");
            }}
            style={styles.option}
          >
            <Text style={[styles.optionText, { color: "#F00" }]}>신고하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOutChat}
            style={[
              styles.option,
              {
                borderTopWidth: 0.5,
                borderTopColor: "#F3EDFF",
              },
            ]}
          >
            <Text style={[styles.optionText, { color: "#797979" }]}>
              채팅방 나가기
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { bottom: insets.bottom + 12 }]}
        >
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    position: "relative",
    ...(Platform.OS === "web" && {
      maxWidth: 468,
      left: "50%",
      transform: [{ translateX: "-50%" }],
    }),
  },
  modalContainer: {
    backgroundColor: "white",

    marginHorizontal: 30,
    bottom: 0,
    left: 0,

    right: 0,
    position: "absolute",
    borderRadius: 16,
  },
  option: {
    paddingVertical: 16,
    alignItems: "center",
  },
  optionText: {
    fontSize: 20,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
  },
  closeButton: {
    backgroundColor: colors.primaryPurple,
    marginHorizontal: 30,
    bottom: 0,
    left: 0,
    paddingVertical: 16,
    right: 0,
    position: "absolute",
    borderRadius: 16,
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    fontSize: 16,
  },
  info: {
    position: "absolute",
    zIndex: 1000,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoText: {
    color: "#EEE8FA",
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Pretendard-Light",
    fontWeight: 300,
    lineHeight: 18,
  },
});

export default ChatMenuModal;
