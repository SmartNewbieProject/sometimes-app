import { BottomNavigation } from "@/src/shared/ui";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useCallback } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import ChatHeader from "./chat-header";
import ChatRoomList from "./room-list/chat-room-list";

function Chat() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["chat-room"] });
    }, [queryClient])
  );

  return (
    <View
      style={{
        backgroundColor: semanticColors.surface.background,
        flex: 1,
        paddingTop: insets.top,
        position: "relative",
      }}
    >
      <ChatHeader />

      <View style={{ flex: 1 }}>
        <ChatRoomList />
      </View>
      <BottomNavigation />
    </View>
  );
}

export default Chat;
