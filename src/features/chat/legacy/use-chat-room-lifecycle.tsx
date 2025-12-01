import { useEffect, useRef } from "react";
import type { ChatEventActions } from "../domain/chat-event-actions";

interface UseChatRoomLifecycleProps {
  chatRoomId: string;
  actions: ChatEventActions;
  isActive?: boolean;
  connected: boolean;
  disconnect: () => void;
}

export const useChatRoomLifecycle = ({
  chatRoomId,
  actions,
  isActive = true,
  connected,
  disconnect,
}: UseChatRoomLifecycleProps) => {
  const hasJoinedRef = useRef(false);
  const actionsRef = useRef(actions);
  const disconnectRef = useRef(disconnect);

  useEffect(() => {
    actionsRef.current = actions;
    disconnectRef.current = disconnect;
  });

  useEffect(() => {
    if (!isActive || !chatRoomId || !connected || hasJoinedRef.current) return;
    actionsRef.current.joinRoom(chatRoomId);
    hasJoinedRef.current = true;

    return () => {
      actionsRef.current.leaveRoom(chatRoomId);
      disconnectRef.current();
      hasJoinedRef.current = false;
    };
  }, [chatRoomId, isActive, connected]);
};
