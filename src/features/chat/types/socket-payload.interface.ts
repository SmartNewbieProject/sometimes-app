export interface SendMessagePayload {
  to: string;
  content: string;
  chatRoomId: string;
}

export interface CreateChatRoomPayload {
  maleId: string;
  femaleId: string;
  matchId: string;
}

export interface GetChatHistoryPayload {
  chatRoomId: string;
  limit?: number;
  offset?: number;
}

export interface LeaveChatRoomPayload {
  chatRoomId: string;
}

export interface TypingPayload {
  to: string;
  chatRoomId: string;
}

export interface UploadImagePayload {
  to: string;
  chatRoomId: string;
  imageData: string;
  mimeType: string;
}

export interface RemoteMessagePayload {
  to: string;
  from: string;
  content: string;
  chatRoomId: string;
}

export interface ReadMessagesPayload {
  chatRoomId: string;
}
