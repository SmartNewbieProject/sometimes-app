import type { Chat } from '../types/chat';

export const updateChatRoomOnNewMessage = (oldData: any, chat: Chat) => {
  if (!oldData || !oldData.pages) {
    return oldData;
  }
  
  let roomFound = false;
  
  const pages = oldData.pages.map((page: any) => {
    if (!page.chatRooms || !Array.isArray(page.chatRooms)) {
      return page;
    }
    
    const updatedChatRooms = page.chatRooms.map((room: any) => {
      if (room.id === chat.chatRoomId) {
        roomFound = true;
        
        return { 
          ...room, 
          recentMessage: chat.content,
          recentDate: chat.createdAt,
          unreadCount: (room.unreadCount || 0) + 1
        };
      }
      
      return room;
    });
    
    return {
      ...page,
      chatRooms: updatedChatRooms
    };
  });
  
  if (!roomFound) {
    console.warn(`Chat room with ID ${chat.chatRoomId} not found in cache`);
  }
  
  return {
    ...oldData,
    pages,
  };
};