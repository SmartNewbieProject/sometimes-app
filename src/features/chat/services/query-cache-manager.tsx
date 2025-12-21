import { dayUtils } from "@/src/shared/libs";
import type { QueryClient } from "@tanstack/react-query";
import type { Chat, ChatRoomListResponse } from "../types/chat";
import { chatEventBus } from "./chat-event-bus";
import { devLogWithTag, devWarn } from "@/src/shared/utils";

class QueryCacheManager {
  private queryClient: QueryClient | null = null;

  initialize(queryClient: QueryClient) {
    this.queryClient = queryClient;

    chatEventBus.on("MESSAGE_OPTIMISTIC_ADDED").subscribe(({ payload }) => {
      this.addOptimisticMessageToCache(payload.chatRoomId, payload);
    });

    chatEventBus.on("MESSAGE_SEND_SUCCESS").subscribe(({ payload }) => {
      this.replaceMessageInCache(
        payload.serverMessage.chatRoomId,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        payload.serverMessage.tempId!,
        payload.serverMessage
      );
    });

    chatEventBus.on("MESSAGES_READ_REQUESTED").subscribe(({ payload }) => {
      this.markRoomAsReadInCache(payload.chatRoomId);
    });

    chatEventBus.on("MESSAGE_SEND_FAILED").subscribe(({ payload }) => {
      this.markMessageAsFailedInCache(payload.tempId, payload.error);
    });

    chatEventBus.on("MESSAGE_RECEIVED").subscribe(({ payload }) => {
      this.addReceivedMessageToCache(payload.chatRoomId, payload);
    });

    chatEventBus.on("IMAGE_UPLOAD_FAILED").subscribe(({ payload }) => {
      this.markMessageAsFailedInCache(payload.tempId, payload.error);
    });

    chatEventBus.on("IMAGE_UPLOAD_STATUS_CHANGED").subscribe(({ payload }) => {
      if (
        payload.uploadStatus === "completed" &&
        payload.mediaUrl &&
        payload.id
      ) {
        this.updateImageUrlInCache(
          payload.chatRoomId,
          payload.id,
          payload.mediaUrl
        );
      }
    });

    chatEventBus.on("IMAGE_UPLOAD_SUCCESS").subscribe(({ payload }) => {
      devLogWithTag('Chat Cache', 'Image upload success');
      this.replaceOptimisticMessageInCache(
        payload.tempId,
        payload.serverMessage
      );
    });
  }

  private addOptimisticMessageToCache(chatRoomId: string, message: Chat) {
    this.queryClient?.setQueryData(
      ["chat-list", chatRoomId],
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: any) => {
        if (!oldData) {
          return {
            pages: [{ messages: [message] }],
            pageParams: [undefined],
          };
        }

        const updatedPages = oldData.pages.map(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                messages: [message, ...page.messages],
              };
            }
            return page;
          }
        );

        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );

    this.queryClient?.invalidateQueries({
      queryKey: ["chat-list", chatRoomId],
    });
  }

  private replaceMessageInCache(
    chatRoomId: string,
    tempId: string,
    serverMessage: Chat
  ) {
    this.queryClient?.setQueryData(
      ["chat-list", chatRoomId],
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (page: any) => ({
            ...page,
            messages: page.messages.map((message: Chat) =>
              message.tempId === tempId || message.id === tempId
                ? {
                    ...serverMessage,
                    optimistic: false,
                    sendingStatus: "sent",
                  }
                : message
            ),
          })
        );

        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );
  }

  private markMessageAsFailedInCache(tempId: string, error?: string) {
    const queries = this.queryClient?.getQueryCache().findAll({
      queryKey: ["chat-list"],
      predicate: (query) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const data = query.state.data as any;
        if (!data?.pages) return false;
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return data.pages.some((page: any) =>
          page.messages.some((msg: Chat) => msg.tempId === tempId)
        );
      },
    });

    // biome-ignore lint/complexity/noForEach: <explanation>
    queries?.forEach((query) => {
      const chatRoomId = query.queryKey[1];
      this.queryClient?.setQueryData(
        ["chat-list", chatRoomId],
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (oldData: any) => {
          if (!oldData) return oldData;
          const updatedPages = oldData.pages.map(
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (page: any) => ({
              ...page,
              messages: page.messages.map((message: Chat) =>
                message.tempId === tempId || message.id === tempId
                  ? {
                      ...message,
                      sendingStatus: "failed" as const,
                      uploadStatus:
                        message.messageType === "image"
                          ? ("failed" as const)
                          : message.uploadStatus,
                    }
                  : message
              ),
            })
          );
          return { ...oldData, pages: updatedPages };
        }
      );
    });

    if (error) {
      console.error("Message send failed2:", error);
    }
  }

  private addReceivedMessageToCache(chatRoomId: string, message: Chat) {
    this.queryClient?.setQueryData(
      ["chat-list", chatRoomId],
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: any) => {
        if (!oldData) return oldData;

        const messageExists = oldData.pages.some(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (page: any) =>
            page.messages.some((msg: Chat) => msg.id === message.id)
        );
        if (messageExists) return oldData;

        const updatedPages = oldData.pages.map(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                messages: [message, ...page.messages],
              };
            }
            return page;
          }
        );
        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );
    this.queryClient?.invalidateQueries({
      queryKey: ["chat-list", chatRoomId],
    });

    if (!chatRoomId || !message) {
      devWarn("Invalid chat message received");
      return;
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    this.queryClient?.setQueryData(["chat-room"], (oldData: any) => {
      if (!oldData) {
        return oldData;
      }

      let roomFound = false;

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const pages = oldData.pages.map((page: any) => {
        if (!page.chatRooms || !Array.isArray(page.chatRooms)) {
          return page;
        }

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const updatedChatRooms = page.chatRooms.map((room: any) => {
          if (room.id === chatRoomId) {
            roomFound = true;

            return {
              ...room,
              recentMessage: message.content,
              recentDate: dayUtils.create().format(),
              unreadCount: (room.unreadCount || 0) + 1,
            };
          }

          return room;
        });

        return {
          ...page,
          chatRooms: updatedChatRooms,
        };
      });
      devLogWithTag('Chat Cache', 'Pages updated');
      if (!roomFound) {
        devWarn(`Chat room ${chatRoomId} not found in cache`);
      }

      return {
        ...oldData,
        pages,
      };
    });
  }

  private markRoomAsReadInCache(chatRoomId: string) {
    const chatRoomQueryKey = ["chat-room"];

    this.queryClient?.setQueryData<{
      pages: ChatRoomListResponse[];
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      pageParams: any[];
    }>(chatRoomQueryKey, (oldData) => {
      if (!oldData) return oldData;
      devLogWithTag('Chat Cache', 'Marking as read:', chatRoomId);
      const updatedPages = oldData.pages.map((page) => ({
        ...page,
        chatRooms: page.chatRooms.map((room) =>
          room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
        ),
      }));

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  }

  private replaceOptimisticMessageInCache(tempId: string, serverMessage: Chat) {
    this.queryClient?.setQueryData(
      ["chat-list", serverMessage.chatRoomId],
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: any) => {
        if (!oldData) return oldData;

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const updatedPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((message: Chat) =>
            message.tempId === tempId || message.id === tempId
              ? { ...serverMessage, optimistic: false, sendingStatus: "sent" }
              : message
          ),
        }));

        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );
  }

  private updateImageUrlInCache(
    chatRoomId: string,
    messageId: string,
    mediaUrl: string
  ) {
    this.queryClient?.setQueryData(
      ["chat-list", chatRoomId],
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        const updatedPages = oldData.pages.map(
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (page: any) => ({
            ...page,
            messages: page.messages.map((message: Chat) => {
              if (message.id === messageId) {
                return {
                  ...message,
                  mediaUrl,
                  uploadStatus: "completed" as const,
                };
              }
              return message;
            }),
          })
        );

        return {
          ...oldData,
          pages: updatedPages,
        };
      }
    );

    this.queryClient?.invalidateQueries({
      queryKey: ["chat-list", chatRoomId],
    });
  }
}

export const queryCacheManager = new QueryCacheManager();
