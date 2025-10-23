import { dayUtils } from "@/src/shared/libs";
import LockChatIcon from "@assets/icons/lock-chat.svg";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import useChatLock from "../../hooks/use-chat-lock";
import type { ChatRoomList } from "../../types/chat";
import ChatProfileImage from "../message/chat-profile-image";

interface ChatRoomCardProps {
  item: ChatRoomList;
}

function ChatRoomCard({ item }: ChatRoomCardProps) {
  if (item.paymentConfirm) {
    return <OpenVariant item={item} />;
  }
  return <Lockariant item={item} />;
}

function Lockariant({ item }: ChatRoomCardProps) {
  const { handleRemove, handleUnlock } = useChatLock(item.id);

  return (
    <View style={{ flex: 1, marginBottom: 8 }}>
      <RenderContent item={item} />
      <View style={styles.blurContainer}>
        <View style={styles.lockIconContainer}>
          <LockChatIcon />
        </View>

        <Pressable onPress={handleRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>삭제</Text>
        </Pressable>
        <Pressable onPress={handleUnlock} style={styles.approveButton}>
          <Text style={styles.approveButtonText}>수락</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OpenVariant({ item }: ChatRoomCardProps) {
  const screenWidth =
    Dimensions.get("window").width > 468 ? 468 : Dimensions.get("window").width;
  const buttonWidth = screenWidth * 0.25;
  const router = useRouter();
  const threshold = buttonWidth / 2;
  const translateX = useRef(new Animated.Value(0)).current;
  const offsetX = useRef(0);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        translateX.stopAnimation((value) => {
          offsetX.current = value;
        });
      },

      onPanResponderMove: (evt, g) => {
        let newX = offsetX.current + g.dx;

        newX = Math.min(0, Math.max(-buttonWidth, newX));
        translateX.setValue(newX);
      },

      onPanResponderRelease: () => {
        translateX.stopAnimation((value) => {
          if (value <= -threshold) {
            Animated.spring(translateX, {
              toValue: -buttonWidth,
              useNativeDriver: false,
            }).start(() => {
              offsetX.current = -buttonWidth;
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
            }).start(() => {
              offsetX.current = 0;
            });
          }
        });
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start(() => {
          offsetX.current = 0;
        });
      },
    })
  ).current;
  return (
    <Pressable
      onPress={() => router.push(`/chat/${item.id}`)}
      style={{ flex: 1, alignItems: "flex-end" }}
    >
      <View style={[styles.deleteButton, { width: buttonWidth }]}>
        <Text style={styles.buttonText}>나가기</Text>
      </View>
      <RenderContent item={item} />
    </Pressable>
  );
}

const RenderContent = ({ item }: ChatRoomCardProps) => {
  const screenWidth =
    Dimensions.get("window").width > 468 ? 468 : Dimensions.get("window").width;

  return (
    <Animated.View style={[styles.roomContainer, { width: screenWidth }]}>
      <ChatProfileImage size={55} imageUri={item.profileImages} />
      <View style={styles.rightContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.nickName}
          </Text>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.recentMessage === ""
              ? "사진"
              : item.recentMessage
              ? item.recentMessage
              : "대화를 시작해볼까요?"}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          {item.paymentConfirm && (
            <Text style={styles.timeText}>
              {dayUtils.formatRelativeTime(item.recentDate)}
            </Text>
          )}
          {item.unreadCount > 0 && item.paymentConfirm ? (
            <View style={styles.unreadCount}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          ) : (
            <View
              style={[styles.unreadCount, { backgroundColor: "transparent" }]}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  roomContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#fff",
    gap: 8,
  },
  contentContainer: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#000",
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
  },
  lastMessageText: {
    color: "#585858",
    fontSize: 14,
    lineHeight: 24,
  },
  infoContainer: {
    gap: 2,
    alignItems: "flex-end",
  },
  timeText: {
    color: "#A2A2A2",
    fontSize: 13,
    lineHeight: 24,
  },
  unreadCount: {
    height: 24,
    minWidth: 24,

    borderRadius: 12,

    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7A4AE2",
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    lineHeight: 12,
    color: "#fff",
  },
  rightContainer: {
    flexDirection: "row",
    paddingTop: 2,
    flex: 1,
    alignItems: "center",
    gap: 8,
    borderBottomColor: "#F0F0F0",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 12,
    right: 12,
    backgroundColor: "#0000004D",
    borderRadius: 20,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  removeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#EFEFEF",
  },
  approveButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#7A4AE2",
  },
  removeButtonText: {
    color: "#8E8E8E",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16,
  },
  lockIconContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
  },
});

export default ChatRoomCard;
