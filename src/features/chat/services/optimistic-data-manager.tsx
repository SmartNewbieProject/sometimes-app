import { dayUtils } from "@/src/shared/libs";
import type { Chat } from "../types/chat";
import { generateTempId } from "../utils/generate-temp-id";
import { chatEventBus } from "./chat-event-bus";

class OptimisticDataManager {
  initialize() {
    chatEventBus.on("MESSAGE_SEND_REQUESTED").subscribe(({ payload }) => {
      const optimisticMessage: Chat = {
        id: payload.tempId,
        tempId: payload.tempId,
        chatRoomId: payload.chatRoomId,
        senderId: payload.senderId,
        messageType: "text",
        content: payload.content,
        createdAt: dayUtils.create().format(),
        updatedAt: dayUtils.create().format(),
        isMe: true,
        isRead: false,
        sendingStatus: "sending",
        optimistic: true,
      };

      chatEventBus.emit({
        type: "MESSAGE_OPTIMISTIC_ADDED",
        payload: optimisticMessage,
      });
    });

    chatEventBus.on("IMAGE_UPLOAD_REQUESTED").subscribe(({ payload }) => {
      const optimisticMessage: Chat = {
        id: payload.tempId,
        tempId: payload.tempId,
        chatRoomId: payload.chatRoomId,
        senderId: payload.senderId,
        messageType: "image",
        content: "",
        createdAt: dayUtils.create().format(),
        updatedAt: dayUtils.create().format(),
        isMe: true,
        isRead: false,
        sendingStatus: "sending",
        uploadStatus: "uploading",
        optimistic: true,
        mediaUrl:
          typeof payload.file === "object" && "uri" in payload.file
            ? payload.file.uri
            : typeof payload.file === "string"
            ? `data:image/jpeg;base64,${payload.file}`
            : "",
      };

      chatEventBus.emit({
        type: "IMAGE_OPTIMISTIC_ADDED",
        payload: { optimisticMessage: optimisticMessage, options: payload },
      });
    });
  }
}

export const optimisticDataManager = new OptimisticDataManager();
