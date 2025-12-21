import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { router, useLocalSearchParams } from "expo-router";
import { Platform, StyleSheet, Text, View, Pressable, FlatList, ActivityIndicator, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import ChevronLeft from "@assets/icons/chevron-left.svg";
import VerticalEllipsisIcon from "@assets/icons/vertical-ellipsis.svg";
import DateDivider from "@/src/features/chat/ui/message/date-divider";
import BackgroundHeartIcon from "@assets/icons/new-chat-banner-heart.svg";
import BulbIcon from "@assets/icons/bulb.svg";
import { SomemateInput } from "@/src/features/somemate/ui";
import { useActiveSession, useMessages, useAnalyzeSession, useCompleteSession, useDeleteSession } from "@/src/features/somemate/queries/use-ai-chat";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMixpanel } from "@/src/shared/hooks";
import type { AiChatMessage } from "@/src/features/somemate/types";
import { sendMessageStream } from "@/src/features/somemate/apis/ai-chat";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryBadge } from "@/src/features/somemate/ui/category-badge";

const useKeyboardHeight = () => {
  const fallbackHeight = useSharedValue(0);
  if (Platform.OS === 'web') {
    return { height: fallbackHeight };
  }
   
  const { useAnimatedKeyboard } = require('react-native-reanimated');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAnimatedKeyboard();
};

type ListItem =
  | { type: "spacer"; id: string }
  | { type: "date"; date: string }
  | { type: "message"; message: AiChatMessage }
  | { type: "analyzeButton" };

export default function SomemateChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const { showModal } = useModal();
  const { somemateEvents } = useMixpanel();
  const queryClient = useQueryClient();

  const { data: activeSession } = useActiveSession();
  const sessionId = params.sessionId || activeSession?.id;

  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
    sessionId || "",
    !!sessionId
  );
  const completeSessionMutation = useCompleteSession();
  const analyzeSessionMutation = useAnalyzeSession();
  const deleteSessionMutation = useDeleteSession();

  const [localMessages, setLocalMessages] = useState<AiChatMessage[]>([]);
  const streamingContentRef = useRef<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTrigger, setStreamingTrigger] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const allMessages = messagesData?.messages || [];
  const displayMessages = useMemo(() => {
    return isStreaming ? [...allMessages, ...localMessages] : allMessages;
  }, [isStreaming, allMessages, localMessages]);

  const keyboard = useKeyboardHeight();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          Platform.OS === "android" || Platform.OS === "web"
            ? 0
            : -keyboard.height.value + insets.bottom,
      },
    ],
  }));

  const handleSend = useCallback(async (message: string) => {
    if (!sessionId || isStreaming) return;

    const userMessage: AiChatMessage = {
      id: `temp-user-${Date.now()}`,
      sessionId,
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setLocalMessages([userMessage]);
    setIsStreaming(true);
    streamingContentRef.current = "";

    const startTime = Date.now();

    somemateEvents.trackMessageSent(sessionId, 'text', message.length);

    try {
      await sendMessageStream(
        sessionId,
        { content: message },
        (chunk) => {
          streamingContentRef.current += chunk;
          setStreamingTrigger(prev => prev + 1);
        }
      );

      const responseTime = Date.now() - startTime;
      somemateEvents.trackMessageReceived(sessionId, 'analysis', responseTime);

      setIsStreaming(false);
      streamingContentRef.current = "";
      setLocalMessages([]);

      queryClient.invalidateQueries({
        queryKey: ["ai-chat", "messages", sessionId]
      });
      queryClient.invalidateQueries({
        queryKey: ["ai-chat", "active-session"]
      });

    } catch (error: any) {
      setIsStreaming(false);
      streamingContentRef.current = "";
      setLocalMessages([]);

      showModal({
        title: t('features.somemate.chat.error.title'),
        children: (
          <Text style={{ textAlign: "center" }}>
            {error?.message || t('features.somemate.chat.error.message_failed')}
          </Text>
        ),
        primaryButton: {
          text: t('features.somemate.chat.error.confirm'),
          onClick: () => {},
        },
      });
    }
  }, [sessionId, isStreaming, queryClient, showModal, t]);

  const handleAnalyze = async () => {
    if (!sessionId) return;

    showModal({
      title: t('features.somemate.chat.analyze.title'),
      children: (
        <Text style={{ textAlign: "center" }}>
          {t('features.somemate.chat.analyze.message')}
        </Text>
      ),
      primaryButton: {
        text: t('features.somemate.chat.analyze.button'),
        onClick: async () => {
          try {
            const analysisStartTime = Date.now();

            somemateEvents.trackAnalysisStarted(sessionId);

            await completeSessionMutation.mutateAsync(sessionId);

            await analyzeSessionMutation.mutateAsync({ sessionId });

            const analysisDuration = Date.now() - analysisStartTime;
            somemateEvents.trackAnalysisCompleted(sessionId, analysisDuration);

            const turnCount = activeSession?.turnCount || 0;
            somemateEvents.trackSessionCompleted(sessionId, turnCount);

            showModal({
              title: t('features.somemate.chat.analyze_started.title'),
              children: (
                <Text style={{ textAlign: "center" }}>
                  {t('features.somemate.chat.analyze_started.message')}
                </Text>
              ),
              primaryButton: {
                text: t('features.somemate.chat.analyze_started.button'),
                onClick: () => {
                  router.push("/chat/somemate-report");
                },
              },
            });
          } catch (error: any) {
            showModal({
              title: t('features.somemate.chat.analyze_error.title'),
              children: (
                <Text style={{ textAlign: "center" }}>
                  {error?.message || t('features.somemate.chat.analyze_error.message')}
                </Text>
              ),
              primaryButton: {
                text: t('features.somemate.chat.analyze_error.confirm'),
                onClick: () => {},
              },
            });
          }
        },
      },
      secondaryButton: {
        text: t('features.somemate.chat.analyze.cancel'),
        onClick: () => {},
      },
    });
  };

  const handleLeaveChat = () => {
    if (!sessionId) return;

    showModal({
      title: t('features.somemate.chat.leave.title'),
      children: (
        <Text style={{ textAlign: "center" }}>
          {t('features.somemate.chat.leave.message')}
        </Text>
      ),
      primaryButton: {
        text: t('features.somemate.chat.leave.button'),
        onClick: async () => {
          try {
            await deleteSessionMutation.mutateAsync(sessionId);

            queryClient.clear();

            showModal({
              title: t('features.somemate.chat.leave.success_title'),
              children: (
                <Text style={{ textAlign: "center" }}>
                  {t('features.somemate.chat.leave.success_message')}
                </Text>
              ),
              primaryButton: {
                text: t('features.somemate.chat.leave.confirm'),
                onClick: () => {
                  router.replace("/chat/somemate");
                },
              },
            });
          } catch (error: any) {
            showModal({
              title: t('features.somemate.chat.leave.error_title'),
              children: (
                <Text style={{ textAlign: "center" }}>
                  {error?.message || t('features.somemate.chat.leave.error_message')}
                </Text>
              ),
              primaryButton: {
                text: t('features.somemate.chat.leave.confirm'),
                onClick: () => {},
              },
            });
          }
        },
      },
      secondaryButton: {
        text: t('features.somemate.chat.leave.cancel'),
        onClick: () => {},
      },
    });
  };

  useEffect(() => {
    const onBackPress = () => {
      router.replace("/chat");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, []);

  const dateStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  }, []);

  const turnCount = activeSession?.turnCount || 0;
  const canAnalyze = turnCount >= 10;

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [
      { type: "spacer", id: "top" },
      { type: "date", date: dateStr },
      { type: "spacer", id: "afterDate" },
      ...displayMessages.map((msg: AiChatMessage) => ({ type: "message" as const, message: msg })),
    ];

    if (isStreaming && streamingContentRef.current) {
      items.push({
        type: "message" as const,
        message: {
          id: "streaming-message",
          sessionId: sessionId || "",
          role: "assistant" as const,
          content: streamingContentRef.current,
          createdAt: new Date(),
        } as AiChatMessage
      });
    }

    if (canAnalyze) {
      items.push({ type: "analyzeButton" as const });
    }

    items.push({ type: "spacer", id: "bottom" });

    return items;
  }, [dateStr, displayMessages, isStreaming, sessionId, canAnalyze, streamingTrigger]);

  // 메시지가 추가되거나 스트리밍 중일 때 자동으로 맨 아래로 스크롤
  useEffect(() => {
    if (listData.length > 0) {
      // 약간의 딜레이를 주어 렌더링 후 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [listData.length, streamingTrigger]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "spacer") {
      return <View style={{ height: 15 }} />;
    }
    if (item.type === "date") {
      return <DateDivider date={item.date} />;
    }
    if (item.type === "message") {
      const isUser = item.message.role === "user";
      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
          ]}
        >
          {!isUser && (
            <Image
              source={require("@assets/images/somemate_miho.png")}
              style={styles.assistantAvatar}
              contentFit="cover"
            />
          )}
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.assistantMessageText,
              ]}
            >
              {item.message.content}
            </Text>
          </View>
        </View>
      );
    }
    if (item.type === "analyzeButton") {
      const buttonText = canAnalyze
        ? t('features.somemate.chat.analyze.button_text', { count: turnCount })
        : t('features.somemate.chat.analyze.button_text_disabled', { count: turnCount });

      const hintText = canAnalyze
        ? t('features.somemate.chat.analyze.hint_enabled')
        : t('features.somemate.chat.analyze.hint_disabled');

      return (
        <View style={styles.analyzeButtonContainer}>
          <Text style={styles.analyzeHintText}>
            {hintText}
          </Text>
          <Pressable
            style={[
              styles.analyzeButton,
              !canAnalyze && styles.analyzeButtonDisabled
            ]}
            onPress={handleAnalyze}
            disabled={!canAnalyze || analyzeSessionMutation.isPending}
          >
            {analyzeSessionMutation.isPending ? (
              <ActivityIndicator color="#7A4AE2" />
            ) : (
              <Text style={[
                styles.analyzeButtonText,
                !canAnalyze && styles.analyzeButtonTextDisabled
              ]}>
                {buttonText}
              </Text>
            )}
          </Pressable>
        </View>
      );
    }
    return null;
  };

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
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/chat")}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <Pressable style={styles.profileSection}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{t('features.somemate.chat.name')}</Text>
              {activeSession?.category && (
                <CategoryBadge category={activeSession.category} />
              )}
            </View>
            <Text style={styles.subtitle}>{t('features.somemate.chat.turn_count', { count: turnCount })}</Text>
          </View>
        </Pressable>
        <Pressable style={styles.menuButton} onPress={handleLeaveChat}>
          <VerticalEllipsisIcon />
        </Pressable>
      </View>

      <Animated.View
        style={[
          {
            flex: 1,
            width: "100%",
            backgroundColor: semanticColors.surface.surface,
            alignContent: "center",
            justifyContent: "center",
          },
          animatedStyles,
        ]}
      >
        {isLoadingMessages ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#7A4AE2" />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                item.type === "spacer" ? item.id : `${item.type}-${index}`
              }
              style={{
                paddingHorizontal: 16,
                width: "100%",
                flex: 1,
              }}
              contentContainerStyle={{
                gap: 10,
              }}
              keyboardShouldPersistTaps="handled"
            />

            <SomemateInput onSend={handleSend} />
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 68,
    backgroundColor: semanticColors.surface.background,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 34,
    marginLeft: 7,
    marginRight: 10,
    height: 34,
    borderRadius: 17,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: semanticColors.text.primary,
    fontWeight: "700",
    fontFamily: "Pretendard-ExtraBold",
    fontSize: 18,
    lineHeight: 19,
  },
  subtitle: {
    color: semanticColors.text.disabled,
    fontSize: 13,
    lineHeight: 19,
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  matchBanner: {
    paddingVertical: 8,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.brand.primary,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    position: "absolute",
    top: 7,
    left: 8,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 27,
    color: semanticColors.text.primary,
  },
  matchName: {
    color: semanticColors.brand.primary,
    fontWeight: "800",
    fontFamily: "Pretendard-ExtraBold",
  },
  matchSubtext: {
    fontSize: 14,
    lineHeight: 21,
    color: semanticColors.text.disabled,
  },
  guideBanner: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.text.muted,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  guideTitle: {
    color: semanticColors.text.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  guideContent: {
    marginTop: 12,
    gap: 4,
    paddingHorizontal: 7,
  },
  guideItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: semanticColors.surface.background,
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
    color: semanticColors.text.muted,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: semanticColors.brand.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: semanticColors.surface.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: semanticColors.text.inverse,
  },
  assistantMessageText: {
    color: semanticColors.text.primary,
  },
  analyzeButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  analyzeHintText: {
    fontSize: 13,
    color: semanticColors.text.disabled,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Pretendard-Regular",
  },
  analyzeButton: {
    backgroundColor: semanticColors.surface.background,
    borderWidth: 2,
    borderColor: semanticColors.brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  analyzeButtonDisabled: {
    backgroundColor: semanticColors.surface.background,
    borderColor: semanticColors.border.default,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: semanticColors.brand.primary,
    fontFamily: "Pretendard-SemiBold",
  },
  analyzeButtonTextDisabled: {
    color: semanticColors.text.disabled,
  },
});

