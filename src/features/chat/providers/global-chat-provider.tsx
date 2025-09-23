import { useEffect } from "react";
import { useAuth } from "../../auth";
import { useGlobalChat } from "../hooks/use-global-chat";
import { chatEventBus } from "../services/chat-event-bus";
import { initializeChatModules } from "../services/init-chat-modules";

export const GlobalChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken } = useAuth();
  useEffect(() => {
    initializeChatModules();
  }, []);

  useEffect(() => {
    if (accessToken) {
      chatEventBus.emit({
        type: "CONNECTION_REQUESTED",
        payload: {
          url: `${process.env.EXPO_PUBLIC_SERVER_URL}` || "",
          token: accessToken,
        },
      });
    }
  }, [accessToken]);

  return <>{children}</>;
};
