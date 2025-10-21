import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { useModal } from '@/src/shared/hooks/use-modal';
import {
  getPushNotificationStatus,
  enablePushNotification,
  disablePushNotification,
  getNotificationPermissionStatus,
} from '@/src/shared/libs/notifications';

export const usePushNotification = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showModal } = useModal();

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPushNotificationStatus();
      setIsEnabled(response.isEnabled);
    } catch (error) {
      console.error('푸시 알림 상태 확인 실패:', error);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAppSettings = useCallback(() => {
    Alert.alert(
      '알림 권한 필요',
      '푸시 알림을 받으려면 설정에서 알림을 허용해주세요.',
      [
        { text: '설정 열기', onPress: () => Linking.openSettings() },
        { text: '취소', style: 'cancel' },
      ]
    );
  }, []);

  const handleEnable = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission = await getNotificationPermissionStatus();

        if (permission !== 'granted') {
          openAppSettings();
          return;
        }
      }

      await enablePushNotification();
      await checkStatus();
    } catch (error) {
      console.error('푸시 알림 활성화 실패:', error);

      const errorMessage = error instanceof Error ? error.message : '푸시 알림 활성화에 실패했습니다.';

      if (Platform.OS === 'web' && errorMessage.includes('등록된 푸시 토큰이 없습니다')) {
        showModal({
          title: '푸시 알림 등록 필요',
          children: '푸시 알림은 모바일 기기에서만 등록할 수 있습니다.\n모바일 앱에서 먼저 알림을 허용해주세요.',
          primaryButton: { text: '확인', onClick: () => {} },
        });
      } else {
        showModal({
          title: '알림 활성화 실패',
          children: errorMessage,
          primaryButton: { text: '확인', onClick: () => {} },
        });
      }
    }
  }, [openAppSettings, checkStatus, showModal]);

  const handleDisable = useCallback(async () => {
    try {
      await disablePushNotification();
      await checkStatus();
    } catch (error) {
      console.error('푸시 알림 비활성화 실패:', error);
      showModal({
        title: '알림 비활성화 실패',
        children: '푸시 알림 비활성화에 실패했습니다. 다시 시도해주세요.',
        primaryButton: { text: '확인', onClick: () => {} },
      });
    }
  }, [checkStatus, showModal]);

  const toggle = useCallback(async () => {
    if (isEnabled) {
      await handleDisable();
    } else {
      await handleEnable();
    }
  }, [isEnabled, handleEnable, handleDisable]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isEnabled,
    isLoading,
    toggle,
    refetch: checkStatus,
  };
};

