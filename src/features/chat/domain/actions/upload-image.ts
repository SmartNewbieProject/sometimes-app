import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';
import { fileToBase64Payload, type RNFileLike } from '../utils/file-to-base64';
import { compressImage, isImageTooLarge } from '../../utils/image-compression';

export const uploadImageAction = async (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  to: string,
  chatRoomId: string,
  file: RNFileLike,
) => {
  const { base64, mimeType } = await fileToBase64Payload(file);
  let finalImageData = base64;

  if (isImageTooLarge(base64, 5 * 1024 * 1024)) {
    try {
      finalImageData = await compressImage(base64, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
        format: 'jpeg'
      });
    } catch (compressionError) {
      console.warn("이미지 압축 실패, 원본 사용:", compressionError);
    }
  }

  socket?.emit('uploadImage', {
    to,
    chatRoomId,
    imageData: finalImageData,
    mimeType,
  });
};
