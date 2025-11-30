import React, { useState } from 'react';
import { semanticColors } from '@/src/shared/constants/colors';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui';
import { useMarkAllAsRead, useDeleteAllRead } from '../queries/use-notification-mutations';
import { useModal } from '@/src/shared/hooks/use-modal';

interface NotificationMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({ visible, onClose }) => {
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteAllReadMutation = useDeleteAllRead();
  const { showModal } = useModal();

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
          onClose();
        },
      },
      secondaryButton: {
        text: '취소',
        onClick: () => {},
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
          onClose();
        },
      },
      secondaryButton: {
        text: '취소',
        onClick: () => {},
      },
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.overlayTouch}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.menuText}>모두 읽기</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleDeleteAllRead}
        >
          <Text style={styles.menuText}>읽은 알림 삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayTouch: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
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
    minWidth: 140,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.background,
  },
});