import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';
import { fileToBase64Payload, type RNFileLike } from '../utils/file-to-base64';

export const uploadImageAction = async (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  to: string,
  chatRoomId: string,
  file: RNFileLike,
) => {
  const { base64, mimeType } = await fileToBase64Payload(file);

  socket?.emit('uploadImage', {
    to,
    chatRoomId,
    imageData: base64,
    mimeType,
  });
};

