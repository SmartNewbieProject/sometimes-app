import { useEffect, useRef } from 'react';
import type { ChatEventActions } from '../domain/chat-event-actions';

interface UseChatRoomLifecycleProps {
  chatRoomId: string;
  actions: ChatEventActions;
  isActive?: boolean;
}

export const useChatRoomLifecycle = ({ 
  chatRoomId, 
  actions,
  isActive = true 
}: UseChatRoomLifecycleProps) => {
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!isActive || !chatRoomId || hasJoinedRef.current) return;

    actions.joinRoom(chatRoomId);
    hasJoinedRef.current = true;

    return () => {
      actions.leaveRoom(chatRoomId);
      hasJoinedRef.current = false;
    };
  }, [chatRoomId, isActive, actions]);
};