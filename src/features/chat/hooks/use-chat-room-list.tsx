import { useMemo } from 'react';
import { useChatRoomListQuery } from '../queries/use-chat-room-list-query';
import type { ChatRoomList } from '../types/chat';

interface useChatRoomListProps {
	keyword: string;
}

function useChatRoomList({ keyword }: useChatRoomListProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useChatRoomListQuery();

	const separateChatRooms = useMemo(() => {
		const chatRooms = data?.pages.flatMap((page) => page.chatRooms) ?? [];
		const sortedByTimeChatRooms = [...chatRooms].sort((a, b) => {
			return new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime();
		});
		const filteredData = sortedByTimeChatRooms.filter((item) => {
			return item?.nickName?.includes(keyword) ?? false;
		});
		const nextData: {
			lock: ChatRoomList[];
			open: ChatRoomList[];
		} = {
			lock: [],
			open: [],
		};

		// biome-ignore lint/complexity/noForEach: grouping sections is clearer here
		filteredData.forEach((item) => {
			if (item.paymentConfirm) {
				nextData.open.push(item);
			} else {
				nextData.lock.push(item);
			}
		});

		return nextData;
	}, [data?.pages, keyword]);

	return {
		data: separateChatRooms,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
	};
}

export default useChatRoomList;
