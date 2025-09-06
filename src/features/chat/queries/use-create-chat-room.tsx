import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createChatRoom } from "../apis";

function useCreateChatRoom() {
  const router = useRouter();
  const { showModal, showErrorModal } = useModal();
  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: ({ chatRoomId }: { chatRoomId: string }) => {
      router.push(`/chat/${chatRoomId}`);
    },
    onError: (error: any) => {
      console.error("채팅방 생성 실패:", error);
      if (error?.response?.status === 409) {
        showModal({
          title: "채팅방 생성 실패",
          children: (
              <View className="flex flex-col w-full items-center">
                <Text className="text-[#666666] text-[14px] text-center">
                  이미 상대방과 채팅방이 개설되었습니다.
                </Text>
              </View>
          ),
          primaryButton: {
            text: "확인",
            onClick: () => {
              router.push("/chat");
            },
          },
        });
        return;
      }
      showErrorModal(
        "채팅방 생성에 실패하였습니다. 관리자에게 문의 바랍니다.",
        "announcement"
      );
    },
  });
}

export default useCreateChatRoom;
