import { useGlobalChat } from '../hooks/use-global-chat';

export const GlobalChatProvider = ({ children }: { children: React.ReactNode }) => {
  useGlobalChat({
    baseUrl: process.env.EXPO_PUBLIC_SERVER_URL || '',
  });

  return <>{children}</>;
};
