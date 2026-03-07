import type { CurrentGem } from '@/src/features/payment/api';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { ChatRoomDetail, ChatRoomList, ChatRoomListResponse } from '../types/chat';

type ChatRoomPages = InfiniteData<ChatRoomListResponse>;

export const updateChatRoomListCache = (
	queryClient: QueryClient,
	chatRoomId: string,
	updater: (room: ChatRoomList) => ChatRoomList | null,
) => {
	queryClient.setQueryData<ChatRoomPages>(['chat-room'], (oldData) => {
		if (!oldData) return oldData;

		const updatedPages = oldData.pages.map((page) => ({
			...page,
			chatRooms: page.chatRooms
				.map((room) => (room.id === chatRoomId ? updater(room) : room))
				.filter((room): room is ChatRoomList => room !== null),
		}));

		return {
			...oldData,
			pages: updatedPages,
		};
	});
};

export const upsertChatRoomInCache = (queryClient: QueryClient, chatRoom: ChatRoomList) => {
	queryClient.setQueryData<ChatRoomPages>(['chat-room'], (oldData) => {
		if (!oldData) {
			return {
				pages: [
					{
						chatRooms: [chatRoom],
						nextCursor: null,
						hasMore: false,
					},
				],
				pageParams: [undefined],
			};
		}

		const pagesWithoutRoom = oldData.pages.map((page) => ({
			...page,
			chatRooms: page.chatRooms.filter((room) => room.id !== chatRoom.id),
		}));

		const [firstPage, ...restPages] = pagesWithoutRoom;

		return {
			...oldData,
			pages: [
				{
					...firstPage,
					chatRooms: [chatRoom, ...firstPage.chatRooms],
				},
				...restPages,
			],
		};
	});
};

export const removeChatRoomFromCache = (queryClient: QueryClient, chatRoomId: string) => {
	updateChatRoomListCache(queryClient, chatRoomId, () => null);
	queryClient.removeQueries({ queryKey: ['chat-detail', chatRoomId], exact: true });
	queryClient.removeQueries({ queryKey: ['chat-list', chatRoomId], exact: true });
};

export const updateChatRoomDetailCache = (
	queryClient: QueryClient,
	chatRoomId: string,
	updater: (detail: ChatRoomDetail) => ChatRoomDetail,
) => {
	queryClient.setQueryData<ChatRoomDetail>(['chat-detail', chatRoomId], (oldData) => {
		if (!oldData) return oldData;
		return updater(oldData);
	});
};

export const updateGemCache = (
	queryClient: QueryClient,
	updater: (gem: CurrentGem) => CurrentGem,
) => {
	queryClient.setQueryData<CurrentGem>(['gem', 'current'], (oldData) => {
		if (!oldData) return oldData;
		return updater(oldData);
	});
};
