import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { buildChatSocketUrl } from "../domain/utils/build-socket-url";
import { useChatStore } from "../store/chat";
import type { Chat } from "../types/chat";

interface UseGlobalChatOptions {
  baseUrl: string;
  namespace?: string;
}

export const useGlobalChat = ({
  baseUrl,
  namespace = "",
}: UseGlobalChatOptions) => {
  const { accessToken } = useAuth();
  const { initSocket, socket, setConnected, isInitialized, disconnectSocket } = useChatStore();
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const url = buildChatSocketUrl(baseUrl, namespace, accessToken);

  const initializeGlobalSocket = useCallback(() => {
    if (!accessToken) return;

    const { socket, isInitialized, initSocket, currentUrl } = useChatStore.getState();

    const needsReconnection = currentToken !== accessToken;
    if (needsReconnection) {
      setCurrentToken(accessToken);
    }

    // 이미 같은 URL로 연결되어 있고 연결 상태라면 재사용
    if (isInitialized && socket?.connected && currentUrl === url) {
      return;
    }

    const globalSocket = initSocket(url, accessToken);
    
    globalSocket.once("connected", () => {
      useChatStore.getState().setConnected(true);
    });

    globalSocket.on("disconnect", (reason) => {
      useChatStore.getState().setConnected(false);
    });

    globalSocket.on("error", (error) => {
      console.error("Global socket error:", error);
      useChatStore.getState().setConnected(false);
    });

    globalSocket.io.on("reconnect", () => {
      useChatStore.getState().setConnected(true);
    });

    globalSocket.io.on("reconnect_failed", () => {
      useChatStore.getState().setConnected(false);
      console.warn("Socket reconnection failed - token might be expired");
    });

    globalSocket.io.on("reconnect_attempt", () => {
      useChatStore.getState().setConnected(false);
    });
  }, [accessToken, url, currentToken]);

  useEffect(() => {
    if (accessToken) {
      initializeGlobalSocket();
    }
  }, [accessToken, initializeGlobalSocket]);

  useEffect(() => {
    return () => {
      const currentSocket = useChatStore.getState().socket;
      if (currentSocket) {
        useChatStore.getState().disconnectSocket();
      }
    };
  }, []);

  return {
    connected: socket?.connected || false,
    socket,
  };
};
