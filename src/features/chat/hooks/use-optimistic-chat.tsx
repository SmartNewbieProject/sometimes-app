import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Chat } from '../types/chat';
import { isTempId } from '../utils/generate-temp-id';
import {dayUtils} from "@shared/libs";

interface UseOptimisticChatProps {
  chatRoomId: string;
}

export const useOptimisticChat = ({ chatRoomId }: UseOptimisticChatProps) => {
  const queryClient = useQueryClient();

  const addOptimisticMessage = useCallback((message: Chat) => {
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) {
        return {
          pages: [{ messages: [message] }],
          pageParams: [undefined],
        };
      }

      const updatedPages = oldData.pages.map((page: any, index: number) => {
        if (index === 0) {
          return {
            ...page,
            messages: [message, ...page.messages],
          };
        }
        return page;
      });

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  }, [chatRoomId, queryClient]);

  // 임시 메시지를 서버 메시지로 교체
  const replaceOptimisticMessage = useCallback((tempId: string, serverMessage: Chat) => {
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) return oldData;

      const updatedPages = oldData.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((message: Chat) => 
          message.tempId === tempId || message.id === tempId
            ? { ...serverMessage, optimistic: false, sendingStatus: 'sent' }
            : message
        ),
      }));

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  }, [chatRoomId, queryClient]);

  const markMessageAsFailed = useCallback((tempId: string, error?: string) => {
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) return oldData;

      const updatedPages = oldData.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((message: Chat) => 
          message.tempId === tempId || message.id === tempId
            ? { 
                ...message, 
                sendingStatus: 'failed' as const,
                uploadStatus: message.messageType === 'image' ? 'failed' as const : message.uploadStatus
              }
            : message
        ),
      }));

      return {
        ...oldData,
        pages: updatedPages,
      };
    });

    if (error) {
      console.error('Message send failed:', error);
    }
  }, [chatRoomId, queryClient]);

  const addReceivedMessage = useCallback((message: Chat) => {
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) return oldData;

      const messageExists = oldData.pages.some((page: any) =>
        page.messages.some((msg: Chat) => msg.id === message.id)
      );

      if (messageExists) return oldData;

      const adjustedMessage = {
        ...message,
        createdAt: adjustTimezone(message.createdAt),
      };

      const updatedPages = oldData.pages.map((page: any, index: number) => {
        if (index === 0) {
          return {
            ...page,
            messages: [adjustedMessage, ...page.messages],
          };
        }
        return page;
      });

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  }, [chatRoomId, queryClient]);

  const updateImageUrl = useCallback((messageId: string, mediaUrl: string) => {
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) return oldData;

      const updatedPages = oldData.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((message: Chat) => 
          message.id === messageId
            ? { 
                ...message, 
                mediaUrl,
                uploadStatus: 'completed' as const
              }
            : message
        ),
      }));

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  }, [chatRoomId, queryClient]);

  return {
    addOptimisticMessage,
    replaceOptimisticMessage,
    markMessageAsFailed,
    addReceivedMessage,
    updateImageUrl,
  };
};

const adjustTimezone = (dateString: string): string =>
  dayUtils.create(dateString)
      .add(9, 'hour')
      .format('YYYY-MM-DD HH:mm:ss');
