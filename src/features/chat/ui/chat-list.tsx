import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Keyboard, View } from 'react-native';

import useChatList from '../queries/use-chat-list';
import { chatEventBus } from '../services/chat-event-bus';

import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chat-store';
import type { Chat, ChatRoomDetail } from '../types/chat';
import ChatMessage from './message/chat-message';
import DateDivider from './message/date-divider';
import SystemMessage from './message/system-message';

type ChatListItem =
	| { type: 'message'; data: Chat }
	| { type: 'date'; data: { date: string; id: string } };

interface ChatListProps {
	setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
	roomDetail?: ChatRoomDetail;
}

const ChatList = ({ setPhotoClicked, roomDetail }: ChatListProps) => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useChatList(id);

	const connectionStatus = useChatStore((s) => s.connectionStatus);

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

	const chatList = useMemo(() => {
		return data?.pages.flatMap((page) => page.messages) ?? [];
	}, [data?.pages]);

	const chatListWithDateDividers = useMemo(() => {
		const sortedChatList = [...chatList].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
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
	}, [chatList, t]);

	const latestSystemMessageId = useMemo(() => {
		return chatList.find((chat) => chat.senderId === 'system')?.id;
	}, [chatList]);

	useEffect(() => {
		if (!id || !latestSystemMessageId) {
			return;
		}

		void queryClient.refetchQueries({ queryKey: ['chat-detail', id] });
	}, [id, latestSystemMessageId, queryClient]);

	const renderItem = useCallback(
		({ item }: { item: ChatListItem }) => {
			if (item.type === 'date') {
				return <DateDivider date={item.data.date} />;
			}
			if (item.data.senderId === 'system') {
				return <SystemMessage item={item.data} />;
			}
			return (
				<ChatMessage
					item={item.data}
					matchId={roomDetail?.matchId}
					partnerId={roomDetail?.partnerId}
					profileImage={roomDetail?.partner.mainProfileImageUrl ?? ''}
				/>
			);
		},
		[roomDetail?.matchId, roomDetail?.partner.mainProfileImageUrl, roomDetail?.partnerId],
	);

	const keyExtractor = useCallback((item: ChatListItem) => item.data.id, []);

	const handlePress = useCallback(() => {
		setTimeout(() => setPhotoClicked(false), 400);
		Keyboard.dismiss();
	}, [setPhotoClicked]);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const scrollViewRef = useRef<FlatList<ChatListItem>>(null);
	const edgeSpacer = useMemo(() => <View style={styles.listSpacer} />, []);

	return (
		<FlatList
			data={chatListWithDateDividers}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			onTouchStart={handlePress}
			inverted
			style={styles.list}
			contentContainerStyle={styles.contentContainer}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.7}
			ref={scrollViewRef}
			ListFooterComponent={edgeSpacer}
			ListHeaderComponent={edgeSpacer}
			automaticallyAdjustContentInsets={false}
			keyboardShouldPersistTaps="handled"
			contentInsetAdjustmentBehavior="never"
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				autoscrollToTopThreshold: 80,
			}}
			automaticallyAdjustKeyboardInsets={true}
			initialNumToRender={20}
			maxToRenderPerBatch={10}
			windowSize={7}
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
	t: (key: string, options?: Record<string, unknown>) => string,
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

const styles = {
	list: {
		paddingHorizontal: 16,
		width: '100%',
		flex: 1,
	},
	contentContainer: {
		gap: 10,
		flexGrow: 1,
	},
	listSpacer: {
		height: 20,
	},
} as const;

export default ChatList;
