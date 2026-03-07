import useLiked from '@/src/features/like/hooks/use-liked';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import useChatRoomList from '../../hooks/use-chat-room-list';
import type { ChatRoomList as ChatRoomListItem } from '../../types/chat';
import ChatSearch from '../chat-search';
import ChatLikeCollapse from './chat-like-collapse';
import ChatRoomCard from './chat-room-card';

interface ChatRoomSection {
	key: 'lock' | 'open';
	title: string;
	titleStyle: 'lock' | 'open';
	data: ChatRoomListItem[];
}

function ChatRoomList() {
	const { t } = useTranslation();
	const { showCollapse } = useLiked();
	const collapse = showCollapse();
	const [keyword, setKeyword] = useState('');
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useChatRoomList({
		keyword,
	});

	const openChatRooms = data.open;
	const lockChatRooms = data.lock;
	const isFetchingRef = useRef(false);
	const canTriggerEndReachedRef = useRef(false);

	const sections = useMemo<ChatRoomSection[]>(() => {
		const nextSections: ChatRoomSection[] = [];

		if (lockChatRooms.length > 0) {
			nextSections.push({
				key: 'lock',
				title: t('features.chat.ui.chat_room_list.new_match_notice'),
				titleStyle: 'lock',
				data: lockChatRooms,
			});
		}

		if (openChatRooms.length > 0) {
			nextSections.push({
				key: 'open',
				title: t('features.chat.ui.chat_room_list.recent_chat'),
				titleStyle: 'open',
				data: openChatRooms,
			});
		}

		return nextSections;
	}, [lockChatRooms, openChatRooms, t]);

	const handleEndReached = useCallback(() => {
		if (
			!canTriggerEndReachedRef.current ||
			!hasNextPage ||
			isFetchingNextPage ||
			isFetchingRef.current
		) {
			return;
		}

		canTriggerEndReachedRef.current = false;
		isFetchingRef.current = true;
		fetchNextPage().finally(() => {
			isFetchingRef.current = false;
		});
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const handleScrollBegin = useCallback(() => {
		canTriggerEndReachedRef.current = true;
	}, []);

	const renderHeader = useCallback(
		() => (
			<>
				{collapse && <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />}
				<View style={styles.headerSpacer} />
				<ChatSearch keyword={keyword} setKeyword={setKeyword} />
			</>
		),
		[collapse, keyword],
	);

	const renderSectionHeader = useCallback(
		({ section }: { section: ChatRoomSection }) => (
			<Text style={section.titleStyle === 'lock' ? styles.lockTitleText : styles.openTitleText}>
				{section.title}
			</Text>
		),
		[],
	);

	const renderItem = useCallback(
		({ item }: { item: ChatRoomListItem }) => <ChatRoomCard item={item} />,
		[],
	);

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={semanticColors.brand.primary} />
				</View>
			);
		}

		return (
			<View style={styles.emptyContainer}>
				<Image style={styles.emptyImage} source={require('@assets/images/no-chat-miho.webp')} />
				<Text style={styles.infoText}>{t('features.chat.ui.chat_room_list.no_chat_title')}</Text>
				<Text style={styles.infoText}>{t('features.chat.ui.chat_room_list.no_chat_subtitle')}</Text>
			</View>
		);
	}, [isLoading, t]);

	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) {
			return <View style={styles.footerSpacer} />;
		}

		return (
			<View style={styles.fetchingMoreContainer}>
				<ActivityIndicator size="small" color={semanticColors.brand.primary} />
			</View>
		);
	}, [isFetchingNextPage]);

	return (
		<SectionList
			sections={sections}
			keyExtractor={(item) => item.id}
			renderItem={renderItem}
			renderSectionHeader={renderSectionHeader}
			ListHeaderComponent={renderHeader}
			ListEmptyComponent={renderEmpty}
			ListFooterComponent={renderFooter}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.4}
			onMomentumScrollBegin={handleScrollBegin}
			onScrollBeginDrag={handleScrollBegin}
			stickySectionHeadersEnabled={false}
			contentContainerStyle={styles.contentContainer}
			initialNumToRender={8}
			windowSize={7}
			showsVerticalScrollIndicator={false}
		/>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 20,
	},
	headerSpacer: {
		height: 18,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 100,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 36,
	},
	emptyImage: {
		width: 216,
		height: 216,
		marginBottom: 20,
	},
	fetchingMoreContainer: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	footerSpacer: {
		height: 20,
	},
	infoText: {
		color: semanticColors.text.disabled,
		fontSize: 18,
		lineHeight: 23,
		marginTop: 4,
	},
	lockTitleText: {
		color: semanticColors.brand.primary,
		fontSize: 12,
		fontWeight: 600,
		paddingHorizontal: 16,
		lineHeight: 18,
		fontFamily: 'Pretendard-SemiBold',
		marginTop: 14,
	},
	openTitleText: {
		color: semanticColors.text.disabled,
		paddingHorizontal: 16,
		fontSize: 12,
		fontWeight: 600,
		lineHeight: 18,
		fontFamily: 'Pretendard-SemiBold',
		marginTop: 14,
	},
});

export default ChatRoomList;
