import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PalePurpleGradient } from '@/src/shared/ui';
import { NotificationList } from '@/src/features/notification/ui/notification-list';
import { useMarkAllAsRead, useDeleteAllRead } from '@/src/features/notification/queries/use-notification-mutations';
import { useUnreadCount } from '@/src/features/notification/queries/use-unread-count';
import { useModal } from '@/src/shared/hooks/use-modal';
import colors from '@/src/shared/constants/colors';
import { router } from 'expo-router';

export default function NotificationPage() {
  const [showMenu, setShowMenu] = useState(false);
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteAllReadMutation = useDeleteAllRead();
  const { showModal } = useModal();
  const { data: unreadCountData } = useUnreadCount();
  const insets = useSafeAreaInsets();
  const hasUnread = (unreadCountData?.data.unreadCount ?? 0) > 0;

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = (notification: any) => {
    if (notification.redirectUrl) {
      router.push(notification.redirectUrl);
      return;
    }

    if (notification.deepLink) {
      console.log('Deep link:', notification.deepLink);
      return;
    }

    console.log('No redirectUrl or deepLink provided');
  };

  const handleMarkAllAsRead = () => {
    showModal({
      title: '모든 알림 읽기',
      children: (
        <Text>모든 알림을 읽음 상태로 변경하시겠습니까?</Text>
      ),
      primaryButton: {
        text: '확인',
        onClick: () => {
          markAllAsReadMutation.mutate();
          setShowMenu(false);
        },
      },
      secondaryButton: {
        text: '취소',
        onClick: () => setShowMenu(false),
      },
    });
  };

  const handleDeleteAllRead = () => {
    showModal({
      title: '읽은 알림 삭제',
      children: (
        <Text>모든 읽은 알림을 삭제하시겠습니까?</Text>
      ),
      primaryButton: {
        text: '확인',
        onClick: () => {
          deleteAllReadMutation.mutate();
          setShowMenu(false);
        },
      },
      secondaryButton: {
        text: '취소',
        onClick: () => setShowMenu(false),
      },
    });
  };

  return (
    <View style={styles.container}>
      <PalePurpleGradient />

      <View style={[styles.topHeader, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>알림</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text style={styles.menuText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={[styles.dropdown, { top: insets.top + 16 + 54 }]}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleMarkAllAsRead}>
            <Text style={[styles.dropdownItemText, hasUnread && styles.activeMenuItem]}>모두 읽기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteAllRead}>
            <Text style={styles.dropdownItemText}>읽은 알림 삭제</Text>
          </TouchableOpacity>
        </View>
      )}

      <NotificationList onNotificationPress={handleNotificationPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    color: '#000000',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 140,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  activeMenuItem: {
    color: colors.primaryPurple,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});