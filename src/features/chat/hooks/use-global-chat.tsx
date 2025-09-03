import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
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
  namespace = "/chat",
}: UseGlobalChatOptions) => {
  const { accessToken } = useAuth();
  const { initSocket, socket, setConnected, isInitialized } = useChatStore();

  const url = buildChatSocketUrl(baseUrl, namespace, accessToken);

  const initializeGlobalSocket = useCallback(() => {
    if (!accessToken || isInitialized) return;

    const globalSocket = initSocket(url, accessToken);
    globalSocket.on("connected", () => {
      setConnected(true);
    });

    globalSocket.on("disconnect", () => {
      setConnected(false);
    });

    globalSocket.on("error", (error) => {
      console.error("Global socket error:", error);
      setConnected(false);
    });

    globalSocket.io.on("reconnect", () => {
      setConnected(true);
    });

    globalSocket.io.on("reconnect_attempt", () => {
      setConnected(false);
    });
  }, [accessToken, isInitialized, url, initSocket, setConnected]);

  useEffect(() => {
    if (accessToken) {
      initializeGlobalSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [accessToken, initializeGlobalSocket]);

  return {
    connected: socket?.connected || false,
    socket,
  };
};
