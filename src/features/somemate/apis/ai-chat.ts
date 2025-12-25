import axiosClient from "@/src/shared/libs/axios";
import { storage } from "@/src/shared/libs/store";
import { Platform } from "react-native";
import EventSourcePolyfill from "react-native-sse";
import type {
  AiChatSession,
  CreateSessionRequest,
  CreateSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  GetReportsResponse,
  SignalReport,
} from "../types";

const AI_CHAT_BASE_URL = "/ai-chat";

export const createSession = async (
  data: CreateSessionRequest
): Promise<CreateSessionResponse> => {
  return axiosClient.post(`${AI_CHAT_BASE_URL}/sessions`, data);
};

export const getActiveSession = async (): Promise<AiChatSession> => {
  return axiosClient.get(`${AI_CHAT_BASE_URL}/sessions/active`);
};

export const sendMessageStream = async (
  sessionId: string,
  data: SendMessageRequest,
  onChunk: (chunk: string) => void
): Promise<SendMessageResponse> => {
  const baseURL = axiosClient.defaults.baseURL || '';
  const token = await getAuthToken();

  if (Platform.OS === 'web') {
    return sendMessageStreamWeb(baseURL, sessionId, data, token, onChunk);
  }

  return sendMessageStreamNative(baseURL, sessionId, data, token, onChunk);
};

const sendMessageStreamWeb = async (
  baseURL: string,
  sessionId: string,
  data: SendMessageRequest,
  token: string,
  onChunk: (chunk: string) => void
): Promise<SendMessageResponse> => {
  const response = await fetch(
    `${baseURL}${AI_CHAT_BASE_URL}/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '메시지 전송에 실패했습니다.');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('스트림을 읽을 수 없습니다.');
  }

  let messageId = '';
  let role: 'user' | 'assistant' = 'assistant';
  let createdAt = new Date();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content') {
              onChunk(parsed.content);
            } else if (parsed.type === 'done') {
              messageId = parsed.messageId;
              role = parsed.role;
              createdAt = new Date(parsed.createdAt);
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message);
            }
          } catch (e) {
            // JSON 파싱 실패는 무시
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    messageId,
    content: '',
    role,
    createdAt,
  };
};

const sendMessageStreamNative = async (
  baseURL: string,
  sessionId: string,
  data: SendMessageRequest,
  token: string,
  onChunk: (chunk: string) => void
): Promise<SendMessageResponse> => {
  return new Promise((resolve, reject) => {
    let messageId = '';
    let role: 'user' | 'assistant' = 'assistant';
    let createdAt = new Date();

    const es = new EventSourcePolyfill(
      `${baseURL}${AI_CHAT_BASE_URL}/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    es.addEventListener('message', (event) => {
      if (!event.data) return;

      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === 'content') {
          onChunk(parsed.content);
        } else if (parsed.type === 'done') {
          messageId = parsed.messageId;
          role = parsed.role;
          createdAt = new Date(parsed.createdAt);
          es.close();
        } else if (parsed.type === 'error') {
          es.close();
          reject(new Error(parsed.message));
        }
      } catch (e) {
        // JSON 파싱 실패는 무시
      }
    });

    es.addEventListener('error', (error) => {
      es.close();
      if (error && typeof error === 'object' && 'message' in error) {
        reject(new Error(String(error.message)));
      } else {
        reject(new Error('메시지 전송에 실패했습니다.'));
      }
    });

    es.addEventListener('close', () => {
      resolve({
        messageId,
        content: '',
        role,
        createdAt,
      });
    });
  });
};

const getAuthToken = async (): Promise<string> => {
  const token = await storage.getItem('access-token');
  return token?.replaceAll('"', '') || '';
};

export const sendMessage = async (
  sessionId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  return axiosClient.post(`${AI_CHAT_BASE_URL}/sessions/${sessionId}/messages`, data);
};

export const getMessages = async (
  sessionId: string
): Promise<GetMessagesResponse> => {
  return axiosClient.get(`${AI_CHAT_BASE_URL}/sessions/${sessionId}/messages`);
};

export const completeSession = async (sessionId: string): Promise<{
  sessionId: string;
  status: string;
  message: string;
}> => {
  return axiosClient.post(`${AI_CHAT_BASE_URL}/sessions/${sessionId}/complete`);
};

export const analyzeSession = async (
  data?: AnalyzeRequest
): Promise<AnalyzeResponse> => {
  return axiosClient.post(`${AI_CHAT_BASE_URL}/analyze`, data || {});
};

export const getReports = async (): Promise<GetReportsResponse> => {
  return axiosClient.get(`${AI_CHAT_BASE_URL}/reports`);
};

export const getReport = async (reportId: string): Promise<SignalReport> => {
  return axiosClient.get(`${AI_CHAT_BASE_URL}/reports/${reportId}`);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  return axiosClient.delete(`${AI_CHAT_BASE_URL}/sessions/${sessionId}`);
};
