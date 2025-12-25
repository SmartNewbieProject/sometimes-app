import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';
import type { Chat } from '../../types/chat';
import { fileToBase64Payload, type RNFileLike } from '../utils/file-to-base64';
import { uriToBase64 } from '@/src/shared/utils/image';
import { compressImage, isImageTooLarge } from '../../utils/image-compression';
import { generateTempId } from '../../utils/generate-temp-id';
import day from "@shared/libs/day";
import {dayUtils} from "@shared/libs";

interface UploadImageOptions {
  to: string;
  chatRoomId: string;
  senderId: string;
  file: RNFileLike | { uri: string };
}

interface UploadImageResult {
  optimisticMessage: Chat;
  promise: Promise<{ success: boolean; serverMessage?: Chat; error?: string }>;
}

export const uploadImageAction = async (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  options: UploadImageOptions,
): Promise<UploadImageResult> => {
  const { to, chatRoomId, senderId, file } = options;
  const tempId = generateTempId();
  const now = dayUtils.create().format();

  const optimisticMessage: Chat = {
    id: tempId,
    tempId,
    chatRoomId,
    senderId,
    messageType: 'image',
    content: '',
    createdAt: now,
    updatedAt: now,
    isMe: true,
    isRead: false,
    sendingStatus: 'sending',
    uploadStatus: 'uploading',
    optimistic: true,
    mediaUrl: (typeof file === 'object' && 'uri' in file) ? file.uri :
              (typeof file === 'string' ? `data:image/jpeg;base64,${file}` : ''),
  };

  const promise = (async () => {
    try {
      if (!socket) {
        return {success: false, error: 'Socket not connected'};
      }

      let base64: string;
      let mimeType = 'image/jpeg';

      if (typeof file === 'object' && 'uri' in file) {
        const base64Result = await uriToBase64(file.uri);
        base64 = base64Result || '';
        mimeType = 'image/jpeg'; // 기본값
      } else if (typeof file === 'string') {
        base64 = file;
        mimeType = 'image/jpeg';
      } else {
        const result = await fileToBase64Payload(file as RNFileLike);
        base64 = result.base64;
        mimeType = result.mimeType;
      }

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

      return new Promise<{ success: boolean; serverMessage?: Chat; error?: string }>((resolve) => {
        const timeout = setTimeout(() => {
          resolve({success: false, error: 'Upload timeout'});
        }, 30000);

        socket.emit('uploadImage', {
          to,
          chatRoomId,
          imageData: finalImageData,
          mimeType,
          tempId,
        }, (response) => {
          clearTimeout(timeout);
          if (response?.success) {
            resolve({
              success: true,
              serverMessage: response.serverMessage,
            });
          } else {
            resolve({
              success: false,
              error: response?.error || 'Upload failed',
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })();

  return {
    optimisticMessage,
    promise,
  };
};
