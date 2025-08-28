import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { useAuth } from "../../auth";
import { createChatEventActions } from "../domain/chat-event-actions";
import { buildChatSocketUrl } from "../domain/utils/build-socket-url";
import type {
  ChatClientToServerEvents,
  ChatMessage,
  ChatServerToClientEvents,
} from "../types/chat-socket.types";

export type ChatSocketCallbacks = {
  onConnected?: (payload: { status: "success"; userId: string }) => void;
  onError?: (payload: { message: string }) => void;
  onNewMessage?: (payload: {
    messageId: string;
    from: string;
    content: string;
    messageType: "text" | "image" | "emoji";
    mediaUrl?: string;
    chatRoomId: string;
    timestamp: string;
  }) => void;
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
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket<
    ChatServerToClientEvents,
    ChatClientToServerEvents
  > | null>(null);

  const url = useMemo(
    () => buildChatSocketUrl(baseUrl, namespace, token),
    [baseUrl, namespace, token]
  );

  const attachListeners = useCallback(
    (sock: Socket<ChatServerToClientEvents, ChatClientToServerEvents>) => {
      sock.on("connected", (p) => {
        setConnected(true);
        onConnected?.(p);
      });

      sock.on("newMessage", (p) => onNewMessage?.(p));
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
    ]
  );

  const connect = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const sock = io(url, {
      transports: ["websocket"],
      withCredentials: true,
    });
    attachListeners(sock);
    socketRef.current = sock;
    return sock;
  }, [attachListeners, url]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!autoConnect) return;
    const s = connect();
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, connect]);

  const chatEventActions = useMemo(
    () => createChatEventActions(() => socketRef.current),
    []
  );

  return {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
    actions: chatEventActions,
    chatEventActions,
  } as const;
};
