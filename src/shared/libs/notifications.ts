import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Router } from 'expo-router';
import axiosClient from './axios';

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
  type: 'comment' | 'like' | 'general';
  articleId?: string;
  commentId?: string;
  userId?: string;
  title: string;
  body: string;
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
      name: '커뮤니티 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: VIBRATION_PATTERN,
      lightColor: LIGHT_COLOR,
      sound: 'default',
      description: '댓글, 좋아요 등 커뮤니티 활동 알림',
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
async function getExpoPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.error('EAS 프로젝트 ID가 설정되지 않았습니다.');
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
    console.warn('실제 기기에서만 푸시 알림을 사용할 수 있습니다.');
    return null;
  }

  try {
    await setupAndroidNotificationChannels();

    const permission = await requestNotificationPermissionIfNeeded();
    if (permission !== 'granted') {
      console.warn('푸시 알림 권한이 거부되었습니다.');
      return null;
    }

    const token = await getExpoPushToken();
    if (!token) return null;

    await registerPushToken(token);
    console.log('푸시 토큰 등록 성공:', token);

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
 * 알림 탭 시 적절한 화면으로 이동하는 핸들러
 */
export function handleNotificationTap(data: NotificationData, router: Router): void {
  try {
    switch (data.type) {
      case 'comment':
        if (data.articleId) {
          router.push(`/community/article/${data.articleId}`);
        }
        break;
      case 'like':
        if (data.articleId) {
          router.push(`/community/article/${data.articleId}`);
        }
        break;
      case 'general':
        router.push('/home');
        break;
      default:
        console.warn('알 수 없는 알림 타입:', data.type);
        router.push('/home');
    }
  } catch (error) {
    console.error('알림 탭 처리 중 오류:', error);
    router.push('/home');
  }
}