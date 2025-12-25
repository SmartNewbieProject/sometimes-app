import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Platform, View } from "react-native";
import { chatEventBus } from "../services/chat-event-bus";
import { useChatActivityReviewTrigger } from "@/src/features/in-app-review";
import { useAuth } from "@/src/features/auth";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import useChatList from "../queries/use-chat-list";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import ChatGuideBanner from "./chat-guide-banner";
import ChatList from "./chat-list";
import ChatRoomHeader from "./chat-room-header";
import ConnectionStatusBanner from "./connection-status-banner";
import GalleryList from "./gallery-list";
import ChatInput from "./input";
import WebChatInput from "./input.web";
import DateDivider from "./message/date-divider";
import NewMatchBanner from "./new-match-banner";

function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [isPhotoClicked, setPhotoClicked] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const messageCountBeforeSendRef = useRef(0);
  const chatStartTimeRef = useRef<number>(Date.now());
  const lastPartnerMessageTimeRef = useRef<number | null>(null);
  const partnerResponseTrackedRef = useRef(false);
  const { my } = useAuth();
  const { chatEvents, matchingEfficiencyEvents } = useMixpanel();

  useFocusEffect(
    useCallback(() => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["chat-list", id] });
        queryClient.invalidateQueries({ queryKey: ["chat-detail", id] });
      }
    }, [id, queryClient])
  );

  const { data, isLoading } = useChatList(id);
  const { data: chatRoomDetail } = useChatRoomDetail(id);

  useEffect(() => {
    const subscription = chatEventBus.on("MESSAGE_SEND_REQUESTED").subscribe(() => {
      const currentChatList = data?.pages.flatMap((page) => page.messages) ?? [];
      messageCountBeforeSendRef.current = currentChatList.length;
    });

    return () => subscription.unsubscribe();
  }, [data]);

  useEffect(() => {
    const subscription = chatEventBus.on("MESSAGE_SEND_SUCCESS").subscribe(({ payload }) => {
      const isFirstMessage = messageCountBeforeSendRef.current === 0;
      const messageType = payload.serverMessage?.messageType || 'text';
      const messageContent = payload.serverMessage?.content || '';
      const messageLength = typeof messageContent === 'string' ? messageContent.length : 0;
      const timeSinceChatStart = Math.floor((Date.now() - chatStartTimeRef.current) / 1000);

      // Chat_Message_Sent 이벤트
      chatEvents.trackMessageSent(id || '', messageType, {
        messageLength,
        isFirstMessage,
        timeSinceChatStartSeconds: timeSinceChatStart,
        chatPartnerId: chatRoomDetail?.partnerId,
      });

      // First_Message_Sent_After_Match 이벤트
      if (isFirstMessage && chatRoomDetail?.createdAt) {
        const chatRoomCreatedAt = new Date(chatRoomDetail.createdAt).getTime();
        const now = Date.now();
        const timeToMessageMs = now - chatRoomCreatedAt;

        matchingEfficiencyEvents.trackFirstMessageSentAfterMatch(
          chatRoomDetail.matchId || '',
          id || '',
          chatRoomDetail.partnerId || '',
          timeToMessageMs
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [id, chatRoomDetail, chatEvents, matchingEfficiencyEvents]);

  const chatList = data?.pages.flatMap((page) => page.messages) ?? [];

  // 인앱 리뷰: 채팅 10회 이상 대화 시 리뷰 요청
  const { myMessageCount, partnerMessageCount } = useMemo(() => {
    if (!my?.id || chatList.length === 0) {
      return { myMessageCount: 0, partnerMessageCount: 0 };
    }
    const myMessages = chatList.filter((msg) => msg.senderId === my.id);
    const partnerMessages = chatList.filter(
      (msg) => msg.senderId !== my.id && msg.senderId !== "system"
    );
    return {
      myMessageCount: myMessages.length,
      partnerMessageCount: partnerMessages.length,
    };
  }, [chatList, my?.id]);

  // Chat_Response 이벤트 (파트너 응답 트래킹)
  useEffect(() => {
    if (!my?.id || !id || chatList.length === 0) return;

    const partnerMessages = chatList.filter(
      (msg) => msg.senderId !== my.id && msg.senderId !== "system"
    );

    if (partnerMessages.length > 0 && !partnerResponseTrackedRef.current) {
      const latestPartnerMessage = partnerMessages[partnerMessages.length - 1];
      const messageTime = latestPartnerMessage.createdAt
        ? new Date(latestPartnerMessage.createdAt).getTime()
        : Date.now();

      // 첫 파트너 응답
      if (!lastPartnerMessageTimeRef.current) {
        const responseTime = Math.floor((messageTime - chatStartTimeRef.current) / 1000);
        chatEvents.trackChatResponse(
          id,
          responseTime,
          true, // isFirstResponse
          partnerMessages.length
        );
        lastPartnerMessageTimeRef.current = messageTime;
        partnerResponseTrackedRef.current = true;
      }
    }
  }, [chatList, my?.id, id, chatEvents]);

  // Chat_Ended 이벤트 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      if (id && chatList.length > 0) {
        const chatDuration = Math.floor((Date.now() - chatStartTimeRef.current) / 1000);
        const totalMessageCount = myMessageCount + partnerMessageCount;

        chatEvents.trackChatEnded(
          id,
          chatDuration,
          totalMessageCount,
          'screen_exit'
        );
      }
    };
  }, [id, chatList.length, myMessageCount, partnerMessageCount, chatEvents]);

  useChatActivityReviewTrigger({
    myMessageCount,
    partnerMessageCount,
    enabled: true,
  });

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const date = `${year}년 ${month}월 ${day}일`;
  const keyboard = useAnimatedKeyboard();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          Platform.OS === "android"
            ? 0
            : -keyboard.height.value + insets.bottom,
      },
    ],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: semanticColors.surface.background,
        paddingTop: insets.top,
        width: "100%",
        paddingBottom: insets.bottom + 4,
      }}
    >
      <ChatRoomHeader />
      <ConnectionStatusBanner />
      <Animated.View
        style={[
          {
            flex: 1,
            width: "100%",
            backgroundColor: semanticColors.surface.surface,
            alignContent: "center",
            justifyContent: "center",
            overflow: "hidden",
          },
          animatedStyles,
        ]}
      >
        {chatList.length < 3 && !isLoading && (
          <>
            {chatList.length < 1 && !isLoading && (
              <>
                <View style={{ height: 15 }} />
                <DateDivider date={date} />
              </>
            )}
            <View style={{ height: 15 }} />
            <NewMatchBanner />
            <View style={{ height: 15 }} />
            <ChatGuideBanner />
          </>
        )}
        <ChatList setPhotoClicked={setPhotoClicked} />

        {Platform.OS === "web" ? (
          <WebChatInput />
        ) : (
          <ChatInput
            isPhotoClicked={isPhotoClicked}
            setPhotoClicked={setPhotoClicked}
          />
        )}
        {isPhotoClicked && <GalleryList isPhotoClicked={isPhotoClicked} />}
      </Animated.View>
    </View>
  );
}

export default ChatScreen;
