import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ChatRoomListResponse } from '../types/chat';

export const useChatRoomRead = () => {
	const queryClient = useQueryClient();

	const markRoomAsRead = useCallback(
		(chatRoomId: string) => {
			const chatRoomQueryKey = ['chat-room'];

			queryClient.setQueryData<{
				pages: ChatRoomListResponse[];
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				pageParams: any[];
			}>(chatRoomQueryKey, (oldData) => {
				if (!oldData) return oldData;
				console.log('oldData', oldData, chatRoomId);
				const updatedPages = oldData.pages.map((page) => ({
					...page,
					chatRooms: page.chatRooms.map((room) =>
						room.id === chatRoomId ? { ...room, unreadCount: 0 } : room,
					),
				}));

				return {
					...oldData,
					pages: updatedPages,
				};
			});
		},
		[queryClient],
	);

	return { markRoomAsRead };
};
