import { useEffect, useRef } from "react";
import type { ChatEventActions } from "../domain/chat-event-actions";

interface UseChatRoomLifecycleProps {
  chatRoomId: string;
  actions: ChatEventActions;
  isActive?: boolean;
  disconnect: () => void;
}

export const useChatRoomLifecycle = ({
  chatRoomId,
  actions,
  isActive = true,
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
    if (!isActive || !chatRoomId || hasJoinedRef.current) return;

    console.log("방 입장:", chatRoomId);
    actionsRef.current.joinRoom(chatRoomId);
    hasJoinedRef.current = true;

    return () => {
      console.log("cleanup 실행 - 방 나가기:", chatRoomId);
      actionsRef.current.leaveRoom(chatRoomId);
      disconnectRef.current();
      hasJoinedRef.current = false;
    };
  }, [chatRoomId, isActive]);
};
