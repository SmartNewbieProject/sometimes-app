import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';
import type { Chat } from '../../types/chat';
import { generateTempId } from '../../utils/generate-temp-id';

interface SendMessageOptions {
  to: string;
  content: string;
  chatRoomId: string;
  senderId: string;
}

interface SendMessageResult {
  optimisticMessage: Chat;
  promise: Promise<{ success: boolean; serverMessage?: Chat; error?: string }>;
}

export const sendMessageAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  options: SendMessageOptions,
): SendMessageResult => {
  const { to, content, chatRoomId, senderId } = options;
  const tempId = generateTempId();
  const now = new Date().toISOString();

  // 낙관적 UI
  const optimisticMessage: Chat = {
    id: tempId,
    tempId,
    chatRoomId,
    senderId,
    messageType: 'text',
    content,
    createdAt: now,
    updatedAt: now,
    isMe: true,
    isRead: false,
    sendingStatus: 'sending',
    optimistic: true,
  };

  const promise = new Promise<{ success: boolean; serverMessage?: Chat; error?: string }>((resolve) => {
    if (!socket) {
      resolve({ success: false, error: 'Socket not connected' });
      return;
    }

    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Timeout' });
    }, 10000);

    socket.emit('sendMessage', { to, content, chatRoomId, tempId }, (response) => {
      clearTimeout(timeout);
      
      if (response?.success) {
        resolve({
          success: true,
          serverMessage: response.serverMessage,
        });
      } else {
        resolve({
          success: false,
          error: response?.error || 'Unknown error',
        });
      }
    });
  });

  return {
    optimisticMessage,
    promise,
  };
};

