import { useMemo } from "react";
import { useChatStore } from "../store/chat";
import { createChatEventActions } from "../domain/chat-event-actions";

export const useChatEvent = () => {
  const { socket } = useChatStore();

  const chatEventActions = useMemo(
    () => createChatEventActions(() => socket),
    [socket]
  );

  return {
    socket,
    actions: chatEventActions,
    chatEventActions,
  } as const;
};
