import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getChatRoomActivityStatus,
	getChatRoomActivitySummary,
	markChatRoomActivityTracked,
} from '../apis';
import type { Activity24hStatus } from '../types/chat-activity';

export const chatActivityKeys = {
	all: ['chat-activity'] as const,
	status: (chatRoomId: string) => [...chatActivityKeys.all, 'status', chatRoomId] as const,
	summary: (needsTracking?: boolean) =>
		[...chatActivityKeys.all, 'summary', needsTracking] as const,
};

export function useChatRoomActivityStatus(chatRoomId: string, enabled = true) {
	return useQuery({
		queryKey: chatActivityKeys.status(chatRoomId),
		queryFn: () => getChatRoomActivityStatus(chatRoomId),
		enabled: enabled && !!chatRoomId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useMarkActivityTracked() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			chatRoomId,
			trackedAt,
			activityStatus,
		}: {
			chatRoomId: string;
			trackedAt: string;
			activityStatus: Activity24hStatus;
		}) => markChatRoomActivityTracked(chatRoomId, { trackedAt, activityStatus }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: chatActivityKeys.status(variables.chatRoomId),
			});
			queryClient.invalidateQueries({
				queryKey: chatActivityKeys.all,
			});
		},
	});
}

export function useChatActivitySummary(needsTracking = false, enabled = true) {
	return useQuery({
		queryKey: chatActivityKeys.summary(needsTracking),
		queryFn: () => getChatRoomActivitySummary(needsTracking),
		enabled,
		staleTime: 2 * 60 * 1000,
	});
}
