import { useLocalSearchParams } from "expo-router";
import { semanticColors } from '@/src/shared/constants/colors';
import React, { memo, useCallback, useState } from "react";
import {
  type GestureResponderEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnimation } from "reanimated-composer";
import useChatRoomDetail from "../../queries/use-chat-room-detail";
import ChatInfoModal from "./info/info-modal";
import ChatMenuModal from "./menu-modal";

interface ChatInfoModalContainerProps {
  visible: boolean;
  onClose: () => void;
}

function ChatInfoModalContainer({
  visible,
  onClose,
}: ChatInfoModalContainerProps) {
  const [isVisible, setVisible] = useState(false);

  const handleOpenMenuModal = () => {
    onClose();
    setVisible(true);
  };
  const { animatedStyle, sharedValues } = useAnimation({
    trigger: visible,
    animateOnMount: false,
    animations: {
      translateX: {
        initial: 191,
        to: 0,
        type: "delay",
        duration: 200,
        delay: 50,
      },
    },
  });

  const handleClose = useCallback((e: GestureResponderEvent) => {
    if (e.currentTarget === e.target) onClose();
  }, []);

  return (
    <>
      <ChatMenuModal visible={isVisible} onClose={() => setVisible(false)} />
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable onPress={handleClose} style={[styles.overlay]}>
          <Animated.View style={[styles.infoContainer, animatedStyle]}>
            <ChatInfoModal>
              <ChatInfoModal.Header />
              <ChatInfoModal.Body />
              <ChatInfoModal.Footer handleOpenMenuModal={handleOpenMenuModal} />
            </ChatInfoModal>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    position: "relative",
    ...(Platform.OS === "web" && {
      maxWidth: 468,
      left: "50%",
      transform: [{ translateX: "-50%" }],
    }),
  },
  infoContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: semanticColors.surface.background,
    width: 191,
  },
});

export default memo(ChatInfoModalContainer);
