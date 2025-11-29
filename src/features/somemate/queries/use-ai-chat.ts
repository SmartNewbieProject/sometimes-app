import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as aiChatApi from "../apis/ai-chat";
import type {
  CreateSessionRequest,
  SendMessageRequest,
  AnalyzeRequest,
} from "../types";

export const AI_CHAT_KEYS = {
  all: ["ai-chat"] as const,
  activeSession: () => [...AI_CHAT_KEYS.all, "active-session"] as const,
  messages: (sessionId: string) =>
    [...AI_CHAT_KEYS.all, "messages", sessionId] as const,
  reports: () => [...AI_CHAT_KEYS.all, "reports"] as const,
  report: (reportId: string) =>
    [...AI_CHAT_KEYS.all, "report", reportId] as const,
};

export const useActiveSession = () => {
  return useQuery({
    queryKey: AI_CHAT_KEYS.activeSession(),
    queryFn: aiChatApi.getActiveSession,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) => aiChatApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_CHAT_KEYS.activeSession() });
    },
  });
};

export const useSendMessage = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      aiChatApi.sendMessageStream(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_CHAT_KEYS.messages(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: AI_CHAT_KEYS.activeSession() });
    },
  });
};

export const useMessages = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: AI_CHAT_KEYS.messages(sessionId),
    queryFn: () => aiChatApi.getMessages(sessionId),
    enabled: enabled && !!sessionId,
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => aiChatApi.completeSession(sessionId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AI_CHAT_KEYS.activeSession() });
    },
  });
};

export const useAnalyzeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: AnalyzeRequest) => aiChatApi.analyzeSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_CHAT_KEYS.reports() });
      queryClient.removeQueries({ queryKey: AI_CHAT_KEYS.activeSession() });
    },
  });
};

export const useReports = () => {
  return useQuery({
    queryKey: AI_CHAT_KEYS.reports(),
    queryFn: aiChatApi.getReports,
    staleTime: 0,
  });
};

export const useReport = (reportId: string) => {
  return useQuery({
    queryKey: AI_CHAT_KEYS.report(reportId),
    queryFn: () => aiChatApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === 'generating' ? 3000 : false;
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => aiChatApi.deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: AI_CHAT_KEYS.activeSession() });
      queryClient.invalidateQueries({ queryKey: AI_CHAT_KEYS.messages(sessionId) });
      queryClient.removeQueries({ queryKey: AI_CHAT_KEYS.all });
    },
  });
};
