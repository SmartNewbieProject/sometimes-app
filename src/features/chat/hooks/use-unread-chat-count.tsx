import { useChatRoomListQuery } from '../queries/use-chat-room-list-query';

export function useUnreadChatCount() {
	const { data } = useChatRoomListQuery();

	const chatRooms = data?.pages.flatMap((page) => page.chatRooms) ?? [];

	const totalUnreadCount = chatRooms.reduce((sum, room) => {
		return sum + (room.unreadCount || 0);
	}, 0);

	return totalUnreadCount;
}
