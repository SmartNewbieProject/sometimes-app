import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import dayUtils from '@/src/shared/libs/day';
import { Text } from '@/src/shared/ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNotificationList } from '../queries/use-notification-list';
import { useMarkAsRead } from '../queries/use-notification-mutations';
import type { Notification } from '../types/notification';
import { ContactImage } from './contact-image';

interface NotificationListProps {
	isRead?: boolean;
	type?: 'general' | 'reward' | 'contact';
	onNotificationPress?: (notification: Notification) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
	isRead,
	type,
	onNotificationPress,
}) => {
	const { t } = useTranslation();
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotificationList({
		isRead,
		type,
	});

	const markAsReadMutation = useMarkAsRead();

	const handleNotificationPress = useCallback(
		(notification: Notification) => {
			if (!notification.isRead) {
				markAsReadMutation.mutate(notification.id);
			}

			if (onNotificationPress) {
				onNotificationPress(notification);
			}
		},
		[markAsReadMutation, onNotificationPress],
	);

	const formatTime = useCallback(
		(dateString: string) => {
			try {
				return dayUtils.formatRelativeTime(dateString);
			} catch {
				return t('apps.notification.index.just_now');
			}
		},
		[t],
	);

	const getNotificationIcon = useCallback((type: 'reward' | 'general' | 'contact') => {
		if (type === 'reward') {
			return require('@/assets/images/notifications/reward.png');
		}
		if (type === 'contact') {
			return null; // contact 타입은 ContactImage 컴포넌트 사용
		}
		return require('@/assets/images/notifications/notification.png');
	}, []);

	const renderNotification = useCallback(
		({ item, index }: { item: Notification; index: number }) => (
			<TouchableOpacity
				style={[
					styles.notificationItem,
					!item.isRead && styles.unreadItem,
					index % 2 === 1 && styles.evenItem,
				]}
				onPress={() => handleNotificationPress(item)}
			>
				<View style={styles.leftSection}>
					{item.type === 'contact' ? (
						<ContactImage imageUrl={item.data?.profileImageUrl} size={58} />
					) : (
						<Image source={getNotificationIcon(item.type)} style={styles.icon} />
					)}
					<View style={styles.content}>
						<Text textColor="black" weight="semibold" style={{ marginBottom: 6 }}>
							{item.title}
						</Text>
						<Text textColor="black" numberOfLines={2} style={{ fontSize: 14 }}>
							{item.content}
						</Text>
						<Text textColor="gray" size="12" style={{ marginTop: 4 }}>
							{formatTime(item.createdAt)}
						</Text>
					</View>
				</View>

				<View style={styles.rightSection}>{!item.isRead && <View style={styles.unreadDot} />}</View>
			</TouchableOpacity>
		),
		[formatTime, getNotificationIcon, handleNotificationPress],
	);

	const keyExtractor = useCallback((item: Notification) => item.id, []);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const notifications = data?.pages.flatMap((page) => page.data) ?? [];

	const footerComponent = useMemo(() => {
		if (!isFetchingNextPage) return null;
		return (
			<View style={styles.loadingMore}>
				<Text>{t('apps.notification.index.loading_more')}</Text>
			</View>
		);
	}, [isFetchingNextPage, t]);

	if (isLoading && notifications.length === 0) {
		return (
			<View style={styles.loadingContainer}>
				<Text>{t('apps.notification.index.loading')}</Text>
			</View>
		);
	}

	if (notifications.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>{t('apps.notification.index.empty')}</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={notifications}
				renderItem={renderNotification}
				keyExtractor={keyExtractor}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.1}
				ListFooterComponent={footerComponent}
				showsVerticalScrollIndicator={false}
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={7}
				removeClippedSubviews
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		color: colors.gray,
	},
	notificationItem: {
		flexDirection: 'row',
		padding: 16,
		alignItems: 'center',
	},
	unreadItem: {
		backgroundColor: `${colors.lightPurple}20`,
	},
	evenItem: {
		backgroundColor: semanticColors.surface.background,
	},
	leftSection: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		width: 48,
		height: 48,
		marginRight: 12,
		resizeMode: 'contain',
	},
	content: {
		marginLeft: 8,
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		color: semanticColors.text.primary,
		marginBottom: 4,
	},
	unreadTitle: {
		fontWeight: '700',
		color: semanticColors.text.primary,
	},
	contentText: {
		fontSize: 14,
		color: semanticColors.text.primary,
		marginBottom: 4,
		lineHeight: 20,
	},
	rightSection: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primaryPurple,
		marginRight: 8,
	},
	loadingMore: {
		padding: 16,
		alignItems: 'center',
	},
});
