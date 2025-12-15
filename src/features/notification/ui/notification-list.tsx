import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/src/shared/ui';
import { useNotificationList } from '../queries/use-notification-list';
import { useMarkAsRead } from '../queries/use-notification-mutations';
import type { Notification } from '../types/notification';
import { ContactImage } from './contact-image';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import dayUtils from '@/src/shared/libs/day';

interface NotificationListProps {
  isRead?: boolean;
  type?: 'general' | 'reward' | 'contact';
  onNotificationPress?: (notification: Notification) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  isRead,
  type,
  onNotificationPress
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNotificationList({ isRead, type });

  const markAsReadMutation = useMarkAsRead();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  
  const formatTime = (dateString: string) => {
    try {
      return dayUtils.formatRelativeTime(dateString);
    } catch {
      return '방금 전';
    }
  };

  const getNotificationIcon = (type: 'reward' | 'general' | 'contact') => {
    if (type === 'reward') {
      return require('@/assets/images/notifications/reward.png');
    } else if (type === 'contact') {
      return null; // contact 타입은 ContactImage 컴포넌트 사용
    }
    return require('@/assets/images/notifications/notification.png');
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadItem,
        index % 2 === 1 && styles.evenItem
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.leftSection}>
        {item.type === 'contact' ? (
          <ContactImage
            imageUrl={item.data?.profileImageUrl}
            size={58}
          />
        ) : (
          <Image
            source={getNotificationIcon(item.type)}
            style={styles.icon}
          />
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

      <View style={styles.rightSection}>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const notifications = data?.pages.flatMap(page => page.data) ?? [];

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>알림을 불러오는 중...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>알림이 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <Text>더 불러오는 중...</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
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
    backgroundColor: colors.lightPurple + '20',
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
