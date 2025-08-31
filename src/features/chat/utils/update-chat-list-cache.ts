import type { Chat } from "../types/chat";

interface PaginatedChatData {
  pages: { messages: Chat[] }[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  pageParams: any[];
}

export const addMessageToChatList = (
  oldData: PaginatedChatData | undefined,
  newMessage: Chat
): PaginatedChatData => {
  if (!oldData) {
    return {
      pages: [{ messages: [newMessage] }],
      pageParams: [undefined],
    };
  }
  
  const newData = {
    pages: oldData.pages.map((page, index) => 
      index === 0 
        ? { ...page, messages: [newMessage, ...page.messages] }
        : page
    ),
    pageParams: [...oldData.pageParams],
  };
  return newData;
};
