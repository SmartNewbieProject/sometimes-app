import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { useTranslation } from 'react-i18next';

interface NotificationTabProps {
  activeTab: 'all' | 'unread' | 'read';
  onTabChange: (tab: 'all' | 'unread' | 'read') => void;
  unreadCount: number;
  readCount: number;
}

export const NotificationTab: React.FC<NotificationTabProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  readCount,
}) => {
  const { t } = useTranslation();
  const tabs = [
    { key: 'all', label: t('apps.notification.index.tab_all'), count: unreadCount + readCount },
    { key: 'unread', label: t('apps.notification.index.tab_unread'), count: unreadCount },
    { key: 'read', label: t('apps.notification.index.tab_read'), count: readCount },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.key ? styles.activeTabText : undefined,
          ].filter(Boolean) as import('react-native').TextStyle[]}>
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View style={[
              styles.countBadge,
              activeTab === tab.key && styles.activeCountBadge,
            ]}>
              <Text style={[
                styles.countText,
                activeTab === tab.key ? styles.activeCountText : undefined,
              ].filter(Boolean) as import('react-native').TextStyle[]}>
                {tab.count > 99 ? '99+' : tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryPurple,
  },
  tabText: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primaryPurple,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeCountBadge: {
    backgroundColor: colors.primaryPurple,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  activeCountText: {
    color: colors.white,
  },
});