import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { useAuth } from "../../auth";
import { createChatEventActions } from "../domain/chat-event-actions";
import { buildChatSocketUrl } from "../domain/utils/build-socket-url";
import { useChatStore } from "../store/chat";
import type { Chat } from "../types/chat";
import type {
  ChatClientToServerEvents,
  ChatMessage,
  ChatServerToClientEvents,
} from "../types/chat-socket.types";

export type ChatSocketCallbacks = {
  onConnected?: (payload: { status: "success"; userId: string }) => void;
  onError?: (payload: { message: string }) => void;
  onNewMessage?: (payload: Chat) => void;
  onChatRoomCreated?: (payload: {
    chatRoomId: string;
    matchId: string;
    timestamp?: string;
  }) => void;
  onChatHistory?: (payload: {
    chatRoomId: string;
    messages: ChatMessage[];
  }) => void;
  onChatRoomLeft?: (payload: { chatRoomId: string }) => void;
  onUserTyping?: (payload: { from: string; chatRoomId: string }) => void;
  onUserStoppedTyping?: (payload: { from: string; chatRoomId: string }) => void;
  onMessagesRead?: (payload: { chatRoomId: string; readerId: string }) => void;
};

export interface UseChatSocketOptions extends ChatSocketCallbacks {
  baseUrl: string;

  namespace?: string;
  autoConnect?: boolean;
}

export const useChatEvent = ({
  baseUrl,
  namespace = "/chat",
  autoConnect = true,
  onConnected,
  onError,
  onNewMessage,
  onChatRoomCreated,
  onChatHistory,
  onChatRoomLeft,
  onUserTyping,
  onUserStoppedTyping,
  onMessagesRead,
}: UseChatSocketOptions) => {
  const { accessToken } = useAuth();
  const token = accessToken;
  const { initSocket, socket, setConnected, disconnectSocket } = useChatStore();
  const url = useMemo(
    () => buildChatSocketUrl(baseUrl, namespace, token),
    [baseUrl, namespace, token]
  );

  const attachListeners = useCallback(
    (sock: Socket<ChatServerToClientEvents, ChatClientToServerEvents>) => {
      console.log(sock, "sock");
      sock.on("connected", (p) => {
        setConnected(true);
        onConnected?.(p);
      });

      sock.on("newMessage", (p) => {
        onNewMessage?.(p);
      });
      sock.on("chatRoomCreated", (p) => onChatRoomCreated?.(p));
      sock.on("chatHistory", (p) => onChatHistory?.(p));
      sock.on("chatRoomLeft", (p) => onChatRoomLeft?.(p));
      sock.on("userTyping", (p) => onUserTyping?.(p));
      sock.on("userStoppedTyping", (p) => onUserStoppedTyping?.(p));
      sock.on("messagesRead", (p) => onMessagesRead?.(p));
      sock.on("error", (p) => onError?.(p));
      sock.io.on("reconnect", () => setConnected(true));
      sock.io.on("reconnect_attempt", () => setConnected(false));
      sock.io.on("error", () => setConnected(false));
      sock.on("disconnect", () => setConnected(false));
    },
    [
      onConnected,
      onNewMessage,
      onChatRoomCreated,
      onChatHistory,
      onChatRoomLeft,
      onUserTyping,
      onUserStoppedTyping,
      onMessagesRead,
      onError,
      socket,
    ]
  );
  const connect = useCallback(() => {
    if (!token || socket) return socket;

    initSocket(url, token ?? "");
    console.log("socket2", socket);

    return socket;
  }, [attachListeners, url, socket, token]);

  useEffect(() => {
    if (socket) {
      console.log("123445");
      attachListeners(socket);
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    disconnectSocket();
    setConnected(false);
  }, [socket]);

  useEffect(() => {
    if (!autoConnect) return;
    const socket = connect();
    return () => {
      socket?.disconnect();
    };
  }, [autoConnect, socket, token]);

  const chatEventActions = useMemo(
    () => createChatEventActions(() => socket),
    [socket]
  );

  return {
    socket,

    connect,
    disconnect,
    actions: chatEventActions,
    chatEventActions,
  } as const;
};
