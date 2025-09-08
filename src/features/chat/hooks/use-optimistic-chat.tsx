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
        const newData = {
          pages: [{ messages: [message] }],
          pageParams: [undefined],
        };
        console.log('Creating new data structure:', newData);
        return newData;
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

      const newData = {
        ...oldData,
        pages: updatedPages,
      };
      return newData;
    });
    
    queryClient.invalidateQueries({ queryKey: ['chat-list', chatRoomId] });
  }, [chatRoomId, queryClient]);

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
    queryClient.invalidateQueries({ queryKey: ['chat-list', chatRoomId] });
  }, [chatRoomId, queryClient]);

  const updateImageUrl = useCallback((messageId: string, mediaUrl: string) => {
    console.log('updateImageUrl called:', { messageId, mediaUrl, chatRoomId });
    queryClient.setQueryData(['chat-list', chatRoomId], (oldData: any) => {
      if (!oldData) {
        return oldData;
      }

      const updatedPages = oldData.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((message: Chat) => {
          if (message.id === messageId) {
            console.log('Found matching message, updating:', { 
              oldMediaUrl: message.mediaUrl, 
              newMediaUrl: mediaUrl,
              oldUploadStatus: message.uploadStatus 
            });
            return { 
              ...message, 
              mediaUrl,
              uploadStatus: 'completed' as const
            };
          }
          return message;
        }),
      }));

      console.log('Updated pages:', updatedPages);
      
      const newData = {
        ...oldData,
        pages: updatedPages,
      };
      
      return newData;
    });
    
    queryClient.invalidateQueries({ queryKey: ['chat-list', chatRoomId] });
  }, [chatRoomId, queryClient]);

  return {
    addOptimisticMessage,
    replaceOptimisticMessage,
    markMessageAsFailed,
    addReceivedMessage,
    updateImageUrl,
  };
};
