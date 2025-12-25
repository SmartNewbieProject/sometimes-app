import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PalePurpleGradient } from '@/src/shared/ui';
import { NotificationList } from '@/src/features/notification/ui/notification-list';
import { useMarkAllAsRead, useDeleteAllRead } from '@/src/features/notification/queries/use-notification-mutations';
import { useUnreadCount } from '@/src/features/notification/queries/use-unread-count';
import { useModal } from '@/src/shared/hooks/use-modal';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NotificationPage() {
  const { t } = useTranslation();
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
    console.log('[Notification] Pressed:', {
      id: notification.id,
      subType: notification.subType,
      redirectUrl: notification.redirectUrl,
      deepLink: notification.deepLink,
      data: notification.data,
    });

    if (notification.redirectUrl) {
      const url = notification.redirectUrl.trim();

      if (!url.startsWith('/')) {
        console.error('[Notification] Invalid redirectUrl format (must start with /):', url);
        showModal({
          title: t('apps.notification.index.error_invalid_link_title'),
          children: <Text>{t('apps.notification.index.error_invalid_link_desc')}</Text>,
          primaryButton: {
            text: t('apps.notification.index.modal_confirm'),
            onClick: () => {},
          },
        });
        return;
      }

      if (url.includes('undefined') || url.includes('null')) {
        console.error('[Notification] Invalid redirectUrl contains undefined/null:', url);
        showModal({
          title: t('apps.notification.index.error_invalid_article_title'),
          children: <Text>{t('apps.notification.index.error_invalid_article_desc')}</Text>,
          primaryButton: {
            text: t('apps.notification.index.modal_confirm'),
            onClick: () => {},
          },
        });
        return;
      }

      const communityMatch = url.match(/^\/community\/([a-zA-Z0-9-]+)$/);
      if (communityMatch) {
        const articleId = communityMatch[1];
        if (articleId && articleId.length > 0) {
          console.log('[Notification] Navigating to community article:', articleId);
          router.push(url);
          return;
        }
      }

      console.log('[Notification] Navigating to:', url);
      router.push(url);
      return;
    }

    if (notification.subType === 'roulette_reminder') {
      router.push('/moment/daily-roulette');
      return;
    }

    if (notification.deepLink) {
      console.log('[Notification] Deep link not implemented:', notification.deepLink);
      return;
    }

    console.warn('[Notification] No redirectUrl or deepLink provided for notification:', notification.id);
  };

  const handleMarkAllAsRead = () => {
    showModal({
      title: t('apps.notification.index.modal_mark_all_read_title'),
      children: (
        <Text>{t('apps.notification.index.modal_mark_all_read_desc')}</Text>
      ),
      primaryButton: {
        text: t('apps.notification.index.modal_confirm'),
        onClick: () => {
          markAllAsReadMutation.mutate();
          setShowMenu(false);
        },
      },
      secondaryButton: {
        text: t('apps.notification.index.modal_cancel'),
        onClick: () => setShowMenu(false),
      },
    });
  };

  const handleDeleteAllRead = () => {
    showModal({
      title: t('apps.notification.index.modal_delete_all_read_title'),
      children: (
        <Text>{t('apps.notification.index.modal_delete_all_read_desc')}</Text>
      ),
      primaryButton: {
        text: t('apps.notification.index.modal_confirm'),
        onClick: () => {
          deleteAllReadMutation.mutate();
          setShowMenu(false);
        },
      },
      secondaryButton: {
        text: t('apps.notification.index.modal_cancel'),
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

        <Text style={styles.title}>{t('apps.notification.index.title')}</Text>

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
            <Text style={[styles.dropdownItemText, hasUnread && styles.activeMenuItem]}>
              {t('apps.notification.index.menu_mark_all_read')}
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteAllRead}>
            <Text style={styles.dropdownItemText}>
              {t('apps.notification.index.menu_delete_all_read')}
            </Text>
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
    backgroundColor: semanticColors.surface.background,
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
    color: semanticColors.text.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    color: semanticColors.text.primary,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: semanticColors.surface.background,
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
    color: semanticColors.text.disabled,
    fontWeight: '500',
  },
  activeMenuItem: {
    color: colors.primaryPurple,
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.background,
  },
});