import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useSupportChat } from '../hooks';
import type { SupportChatMessage as MessageType, SupportDomain } from '../types';
import SupportChatInput from './support-chat-input';
import SupportChatMessage from './support-chat-message';
import SupportChatStatusBanner from './support-chat-status-banner';

function SupportChatScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const flatListRef = useRef<FlatList<MessageType>>(null);

	const {
		messages,
		status,
		isConnected,
		isLoading,
		isTyping,
		error,
		initSession,
		sendMessage,
		setTyping,
	} = useSupportChat({
		onStatusChange: (newStatus) => {
			console.log('[SupportChatScreen] Status changed:', newStatus);
		},
		onError: (err) => {
			console.error('[SupportChatScreen] Error:', err);
		},
	});

	const currentDomain = useMemo((): SupportDomain | null => {
		for (let i = messages.length - 1; i >= 0; i--) {
			const domain = messages[i].metadata?.domain;
			if (domain) return domain;
		}
		return null;
	}, [messages]);

	useEffect(() => {
		initSession();
	}, [initSession]);

	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages.length]);

	const handleSend = useCallback(
		(content: string) => {
			sendMessage(content);
		},
		[sendMessage],
	);

	const handleTyping = useCallback(
		(typing: boolean) => {
			setTyping(typing);
		},
		[setTyping],
	);

	const renderMessage = useCallback(
		({ item }: { item: MessageType }) => (
			<SupportChatMessage
				content={item.content}
				senderType={item.senderType}
				createdAt={item.createdAt}
				phase={item.metadata?.phase}
			/>
		),
		[],
	);

	const keyExtractor = useCallback((item: MessageType) => item.id, []);

	const renderEmptyState = () => {
		if (isLoading) {
			return (
				<View style={styles.emptyContainer}>
					<ActivityIndicator size="large" color={semanticColors.brand.primary} />
					<Text style={styles.loadingText}>{t('features.support-chat.loading')}</Text>
				</View>
			);
		}

		if (error) {
			return (
				<View style={styles.emptyContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			);
		}

		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyTitle}>{t('features.support-chat.empty.title')}</Text>
				<Text style={styles.emptyDescription}>{t('features.support-chat.empty.description')}</Text>
			</View>
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<ChevronLeftIcon width={24} height={24} />
				</Pressable>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>{t('features.support-chat.header_title')}</Text>
					{currentDomain && (
						<View style={styles.domainBadge}>
							<Text style={styles.domainBadgeText}>
								{t(`features.support-chat.domain.${currentDomain}`)}
							</Text>
						</View>
					)}
				</View>
				<View style={styles.headerRight} />
			</View>

			{status && <SupportChatStatusBanner status={status} isTyping={isTyping} />}

			<FlatList
				ref={flatListRef}
				data={messages}
				renderItem={renderMessage}
				keyExtractor={keyExtractor}
				contentContainerStyle={[styles.messageList, messages.length === 0 && styles.emptyList]}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
				onContentSizeChange={() => {
					if (messages.length > 0) {
						flatListRef.current?.scrollToEnd({ animated: false });
					}
				}}
			/>

			<SupportChatInput
				onSend={handleSend}
				onTyping={handleTyping}
				disabled={!isConnected || status === 'resolved'}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 56,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: semanticColors.border.smooth,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerCenter: {
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	domainBadge: {
		marginTop: 2,
		paddingHorizontal: 8,
		paddingVertical: 2,
		backgroundColor: semanticColors.surface.tertiary,
		borderRadius: 10,
	},
	domainBadgeText: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Medium',
	},
	headerRight: {
		width: 40,
	},
	messageList: {
		flexGrow: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	emptyList: {
		justifyContent: 'center',
	},
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 32,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 14,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
	},
	errorText: {
		fontSize: 14,
		color: semanticColors.state.error,
		textAlign: 'center',
		fontFamily: 'Pretendard-Regular',
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: semanticColors.text.primary,
		marginBottom: 8,
		fontFamily: 'Pretendard-SemiBold',
	},
	emptyDescription: {
		fontSize: 14,
		color: semanticColors.text.muted,
		textAlign: 'center',
		lineHeight: 20,
		fontFamily: 'Pretendard-Regular',
	},
});

export default SupportChatScreen;
