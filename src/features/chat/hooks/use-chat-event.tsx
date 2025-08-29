import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { useAuth } from "../../auth";
import { createChatEventActions } from "../domain/chat-event-actions";
import { buildChatSocketUrl } from "../domain/utils/build-socket-url";
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
  ...callbacks
}: UseChatSocketOptions) => {
  const { accessToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket<
    ChatServerToClientEvents,
    ChatClientToServerEvents
  > | null>(null);

  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const url = useMemo(
    () => buildChatSocketUrl(baseUrl, namespace, accessToken),
    [baseUrl, namespace, accessToken]
  );

  const attachListeners = useCallback(
    (sock: Socket<ChatServerToClientEvents, ChatClientToServerEvents>) => {
      sock.on("connected", (p) => {
        setConnected(true);
        callbacksRef.current.onConnected?.(p);
      });
      sock.on("newMessage", (p) => callbacksRef.current.onNewMessage?.(p));
      sock.on("chatRoomCreated", (p) =>
        callbacksRef.current.onChatRoomCreated?.(p)
      );
      sock.on("error", (p) => callbacksRef.current.onError?.(p));

      sock.io.on("reconnect", () => setConnected(true));
      sock.io.on("reconnect_attempt", () => setConnected(false));
      sock.io.on("error", () => setConnected(false));
      sock.on("disconnect", () => setConnected(false));
    },
    []
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
