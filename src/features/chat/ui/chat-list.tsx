import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Keyboard, View } from 'react-native';

import useChatList from '../queries/use-chat-list';
import useChatRoomDetail from '../queries/use-chat-room-detail';
import { chatEventBus } from '../services/chat-event-bus';

import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chat-store';
import type { Chat } from '../types/chat';
import ChatMessage from './message/chat-message';
import DateDivider from './message/date-divider';
import SystemMessage from './message/system-message';

type ChatListItem =
	| { type: 'message'; data: Chat }
	| { type: 'date'; data: { date: string; id: string } };

interface ChatListProps {
	setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatList = ({ setPhotoClicked }: ChatListProps) => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { t } = useTranslation();

	const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useChatList(id);
	const { data: roomDetail } = useChatRoomDetail(id);

	const { connectionStatus } = useChatStore();

	useEffect(() => {
		const isConnected = connectionStatus === 'connected';

		if (id && isConnected) {
			chatEventBus.emit({
				type: 'CHAT_ROOM_JOIN_REQUESTED',
				payload: { chatRoomId: id },
			});
			chatEventBus.emit({
				type: 'MESSAGES_READ_REQUESTED',
				payload: { chatRoomId: id },
			});

			return () => {
				chatEventBus.emit({
					type: 'CHAT_ROOM_LEAVE_REQUESTED',
					payload: { chatRoomId: id },
				});
			};
		}
	}, [id, connectionStatus]);

	const chatList = data?.pages.flatMap((page) => page.messages) ?? [];

	const formattedChatList = chatList.map((chat) => {
		const date = new Date(chat.createdAt);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		return { ...chat, createdAt: formattedDate };
	});

	const sortedChatList = useMemo(() => {
		return [...formattedChatList]
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
			.reverse();
	}, [JSON.stringify(formattedChatList)]);

	const chatListWithDateDividers = useMemo(() => {
		const items: ChatListItem[] = [];
		for (let i = 0; i < sortedChatList.length; i++) {
			const currentMessage = sortedChatList[i];
			const nextMessage = sortedChatList[i + 1];
			const currentDate = new Date(currentMessage.createdAt);
			const nextDate = nextMessage ? new Date(nextMessage.createdAt) : null;
			items.push({ type: 'message', data: currentMessage });
			if (!nextDate || !isSameDay(currentDate, nextDate)) {
				items.push({
					type: 'date',
					data: {
						date: formatDateWithTranslation(currentDate, t),
						id: `date-${currentDate.toDateString()}`,
					},
				});
			}
		}
		return items;
	}, [sortedChatList, t]);

	const renderItem = ({ item }: { item: ChatListItem }) => {
		if (item.type === 'date') {
			return <DateDivider date={item.data.date} />;
		}
		if (item.data.senderId === 'system') {
			return <SystemMessage item={item.data} />;
		}
		return (
			<ChatMessage profileImage={roomDetail?.partner.mainProfileImageUrl ?? ''} item={item.data} />
		);
	};

	const handlePress = () => {
		setTimeout(() => setPhotoClicked(false), 400);
		Keyboard.dismiss();
	};

	const scrollViewRef = useRef<FlatList<ChatListItem>>(null);

	return (
		<FlatList
			data={chatListWithDateDividers}
			renderItem={renderItem}
			keyExtractor={(item) => item.data.id}
			onTouchStart={handlePress}
			inverted
			style={{
				paddingHorizontal: 16,
				width: '100%',
				flex: 1,
			}}
			contentContainerStyle={{
				gap: 10,
				flexGrow: 1,
			}}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			}}
			onEndReachedThreshold={0.7}
			ref={scrollViewRef}
			ListFooterComponent={<View style={{ height: 20 }} />}
			ListHeaderComponent={<View style={{ height: 20 }} />}
			automaticallyAdjustContentInsets={false}
			keyboardShouldPersistTaps="handled"
			contentInsetAdjustmentBehavior="never"
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				autoscrollToTopThreshold: 80,
			}}
			automaticallyAdjustKeyboardInsets={true}
		/>
	);
};

const isSameDay = (date1: Date, date2: Date): boolean => {
	const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
	const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
	return d1.getTime() === d2.getTime();
};

const formatDateWithTranslation = (
	date: Date,
	t: (key: string, options?: Record<string, any>) => string,
): string => {
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (isSameDay(date, today)) return t('features.chat.ui.chat_screen.today');
	if (isSameDay(date, yesterday)) return t('features.chat.ui.chat_screen.yesterday');

	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return t('features.chat.ui.chat_screen.date_format', { year, month, day });
};

export default ChatList;
