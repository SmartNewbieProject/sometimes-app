import type { Chat } from '../types/chat';

export const updateChatRoomOnNewMessage = (oldData: any, chat: Chat) => {
  if (!oldData) return oldData;
  
  const pages = oldData.pages.map((page: any) => ({
    ...page,
    chatRooms: page.chatRooms.map((room: any) => 
      room.id === chat.chatRoomId 
        ? { 
            ...room, 
            recentMessage: chat.content,
            recentDate: chat.createdAt,
            unreadCount: (room.unreadCount || 0) + 1
          }
        : room
    )
  }));
  
  return {
    ...oldData,
    pages,
  };
};