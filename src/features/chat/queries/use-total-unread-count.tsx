import { useMemo } from 'react';
import { useChatRoomListQuery } from './use-chat-room-list-query';

export const useTotalUnreadCount = () => {
	const { data } = useChatRoomListQuery();

	const totalUnreadCount = useMemo(() => {
		if (!data?.pages) return 0;

		return data.pages
			.flatMap((page) => page.chatRooms)
			.filter((room) => room.paymentConfirm)
			.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
	}, [data?.pages]);

	return totalUnreadCount;
};
