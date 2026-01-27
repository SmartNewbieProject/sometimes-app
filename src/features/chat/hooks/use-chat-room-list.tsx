import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useChatRoomListQuery } from '../queries/use-chat-room-list-query';
import type { ChatRoomList } from '../types/chat';

interface useChatRoomListProps {
	keyword: string;
}

function useChatRoomList({ keyword }: useChatRoomListProps) {
	const separateChatRooms: {
		lock: ChatRoomList[];
		open: ChatRoomList[];
	} = {
		lock: [],
		open: [],
	};
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useChatRoomListQuery();
	const chatRooms = data?.pages.flatMap((page) => page.chatRooms) ?? [];

	const sortedByTimeChatRooms = [...chatRooms].sort((a, b) => {
		return new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime();
	});

	const filteredData = sortedByTimeChatRooms.filter((item) => {
		return item?.nickName?.includes(keyword) ?? false;
	});

	// biome-ignore lint/complexity/noForEach: <explanation>
	filteredData.forEach((item) => {
		if (item.paymentConfirm) {
			separateChatRooms.open.push(item);
		} else {
			separateChatRooms.lock.push(item);
		}
	});
	return {
		data: separateChatRooms,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
	};
}

export default useChatRoomList;
