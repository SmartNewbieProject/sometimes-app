import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Router } from 'expo-router';
import axiosClient from './axios';
import i18n from "@/src/shared/libs/i18n";

// 상수 정의
const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  COMMUNITY: 'community',
} as const;

const VIBRATION_PATTERN = [0, 250, 250, 250];
const LIGHT_COLOR = '#FF231F7C';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 알림 데이터 타입 정의
 */
export interface NotificationData {
  type: 'comment' | 'like' | 'general' | 'match_like' | 'match_connection' | 'reply' | 'comment_like';
  articleId?: string;
  commentId?: string;
  userId?: string;
  title?: string;
  body?: string;
  data?: unknown;
}

/**
 * Android 알림 채널을 설정합니다.
 */
async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Promise.all([
    Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DEFAULT, {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: VIBRATION_PATTERN,
      lightColor: LIGHT_COLOR,
      sound: 'default',
    }),
    Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.COMMUNITY, {
      name: i18n.t('shareds.hooks.notifications.channel_community_name'),
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: VIBRATION_PATTERN,
      lightColor: LIGHT_COLOR,
      sound: 'default',
      description: i18n.t('shareds.hooks.notifications.channel_community_description'),
    }),
  ]);
}

/**
 * 알림 권한을 확인하고 필요시 요청합니다.
 */
async function requestNotificationPermissionIfNeeded(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  return existingStatus;
}

/**
 * Expo 푸시 토큰을 획득합니다.
 */
export async function getExpoPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error(i18n.t('shareds.hooks.notifications.error_eas_project_id_not_set'));
    return null;
  }

  const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return pushTokenData.data;
}

/**
 * 푸시 알림 권한을 요청하고 토큰을 획득하여 백엔드에 등록합니다.
 * @returns 푸시 토큰 또는 null
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn(i18n.t('shareds.hooks.notifications.warning_push_only_on_device'));
    return null;
  }

  try {
    await setupAndroidNotificationChannels();

    const permission = await requestNotificationPermissionIfNeeded();
    if (permission !== 'granted') {
      console.warn(i18n.t('shareds.hooks.notifications.warning_permission_denied'));
      return null;
    }

    const token = await getExpoPushToken();
    if (!token) return null;

    await registerPushToken(token);
    console.log(i18n.t('shareds.hooks.notifications.success_token_registration'), token);

    return token;
  } catch (error) {
    console.error('푸시 토큰 등록 실패:', error);
    return null;
  }
}

/**
 * 백엔드에 푸시 토큰을 등록합니다.
 */
async function registerPushToken(pushToken: string): Promise<void> {
  const payload = {
    pushToken,
    deviceId: Constants.deviceId || 'unknown',
    platform: Platform.OS,
  };

  await axiosClient.post('/push-notifications/register-token', payload);
  console.log('푸시 토큰 백엔드 등록 성공');
}

/**
 * 푸시 토큰 API 응답 타입
 */
interface PushTokenResponse {
  data: {
    id: string;
    pushToken: string;
    deviceId: string;
    platform: string;
    userId: string;
    isActive: string;
    createdAt: string;
    updatedAt: string;
    lastUsedAt: string;
    deletedAt: string | null;
  }[];
  success: boolean;
  message: string;
}

/**
 * 백엔드에서 현재 사용자의 푸시 토큰 등록 여부를 확인합니다.
 */
export async function checkPushTokenRegistered(): Promise<boolean> {
  try {
    const response = await axiosClient.get('/push-notifications/tokens') as PushTokenResponse;

    return response?.success === true &&
           Array.isArray(response?.data) &&
           response.data.length > 0;
  } catch (error) {
    console.error('푸시 토큰 조회 실패:', error);
    return false;
  }
}

/**
 * 모달 옵션 타입
 */
interface ModalOptions {
  title: string;
  children: string;
  primaryButton: { text: string; onClick: () => void };
  secondaryButton?: { text: string; onClick: () => void };
}

/**
 * 푸시 토큰 등록 여부를 확인하고 등록되지 않은 경우 사용자에게 알림 허용 여부를 확인한 후 등록을 시도합니다.
 * 기존 로그인된 사용자들을 위한 함수입니다.
 * 로그인 시점이 아닌 홈 화면 진입 시에만 호출되어야 합니다.
 */
export async function ensurePushTokenRegistered(
  showModal?: (options: ModalOptions) => void
): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  if (!showModal) {
    console.warn('showModal 함수가 제공되지 않아 푸시 토큰 등록을 건너뜁니다.');
    return;
  }

  try {
    const isRegistered = await checkPushTokenRegistered();
    if (Platform.OS === 'web') return;

    if (!isRegistered) {
      showModal({
        title: i18n.t('shareds.hooks.notifications.modal_title_allow_notifications'),
        children: i18n.t('shareds.hooks.notifications.modal_body_allow_notifications'),
        primaryButton: {
          text: i18n.t('shareds.hooks.notifications.button_allow'),
          onClick: async () => {
            try {
              await registerForPushNotificationsAsync();
            } catch (error) {
      console.error(i18n.t('shareds.hooks.notifications.error_token_registration'), error);
            }
          }
        },
        secondaryButton: {
          text: i18n.t('shareds.hooks.notifications.button_later'),
          onClick: () => {
            // 사용자가 알림을 거부한 경우 아무 작업 안 함
          }
        }
      });
    }
  } catch (error) {
    console.error('푸시 토큰 등록 확인 중 오류:', error);
  }
}

/**
 * 알림 권한 상태를 확인합니다.
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * 알림 권한을 다시 요청합니다.
 */
export async function requestNotificationPermission(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * 푸시 알림 상태 응답 타입
 */
export interface PushNotificationStatusResponse {
  isEnabled: boolean;
  tokenCount: number;
  activeTokenCount: number;
}

/**
 * 현재 사용자의 푸시 알림 활성화 상태를 확인합니다.
 */
export async function getPushNotificationStatus(): Promise<PushNotificationStatusResponse> {
  return axiosClient.get('/push-notifications/status');
}

/**
 * 푸시 알림을 활성화합니다.
 * 웹: 등록된 모든 토큰을 활성화
 * 모바일: 토큰이 없으면 새로 등록하고, 등록된 모든 토큰을 활성화
 */
export async function enablePushNotification(): Promise<void> {
  if (Platform.OS !== 'web') {
    const token = await registerForPushNotificationsAsync();
    if (!token) {
      throw new Error('푸시 토큰 획득 실패');
    }
  }

  const response = await axiosClient.get('/push-notifications/tokens') as PushTokenResponse;

  if (!response?.success || !Array.isArray(response?.data) || response.data.length === 0) {
    throw new Error('등록된 푸시 토큰이 없습니다. 모바일 앱에서 먼저 알림을 허용해주세요.');
  }

  await Promise.all(
    response.data.map((tokenData) =>
      axiosClient.patch('/push-notifications/enable', { pushToken: tokenData.pushToken })
    )
  );
}

/**
 * 푸시 알림을 비활성화합니다.
 * 등록된 모든 푸시 토큰을 비활성화합니다.
 */
export async function disablePushNotification(): Promise<void> {
  const response = await axiosClient.get('/push-notifications/tokens') as PushTokenResponse;

  if (!response?.success || !Array.isArray(response?.data) || response.data.length === 0) {
    console.warn('비활성화할 푸시 토큰이 없습니다.');
    return;
  }

  await Promise.all(
    response.data.map((tokenData) =>
      axiosClient.patch('/push-notifications/disable', { pushToken: tokenData.pushToken })
    )
  );
}

export function handleNotificationTap(data: NotificationData, router: Router): void {
  const navigateWithDelay = (path: string) => {
    setTimeout(() => {
      try {
        router.push(path as any);
      } catch (error) {
        router.push('/home');
      }
    }, 100);
  };

  try {
    switch (data.type) {
      case 'comment':
        if (data.articleId) {
          navigateWithDelay(`/community/${data.articleId}`);
        }
        break;
      case 'like':
        if (data.articleId) {
          navigateWithDelay(`/community/${data.articleId}`);
        }
        break;
      case 'reply':
        if (data.articleId) {
          navigateWithDelay(`/community/${data.articleId}`);
        }
        break;
      case 'comment_like':
        if (data.articleId) {
          navigateWithDelay(`/community/${data.articleId}`);
        }
        break;
      case 'match_like':
      case 'match_connection':
        navigateWithDelay('/post-box/liked-me');
        break;
      case 'general':
        navigateWithDelay('/home');
        break;
      default:
        navigateWithDelay('/home');
    }
  } catch (error) {
    navigateWithDelay('/home');
  }
}