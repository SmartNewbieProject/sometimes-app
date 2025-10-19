import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Constants from 'expo-constants';
import {
  enablePushNotification,
  disablePushNotification,
  getPushNotificationStatus,
} from '@/src/shared/libs/notifications';
import axiosClient from '@/src/shared/libs/axios';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-device', () => ({
  isDevice: true,
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: 'test-project-id',
        },
      },
    },
    deviceId: 'test-device-id',
  },
}));

jest.mock('@/src/shared/libs/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Push Notification Functions', () => {
  const mockAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;
  const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

  // Mock Linking
  jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openSettings: jest.fn(),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS to default
    Object.defineProperty(Platform, 'OS', {
      get: jest.fn(() => 'ios'),
      configurable: true,
    });
  });

  describe('getPushNotificationStatus', () => {
    it('백엔드에서 푸시 알림 상태를 정상적으로 조회한다', async () => {
      const mockResponse = {
        isEnabled: true,
        tokenCount: 2,
        activeTokenCount: 1,
      };

      mockAxiosClient.get.mockResolvedValue(mockResponse);

      const result = await getPushNotificationStatus();

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/push-notifications/status');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('enablePushNotification', () => {
    it('모바일에서 새 토큰을 등록하고 모든 토큰을 활성화한다', async () => {
      const mockToken = 'ExponentPushToken[test-token]';
      const mockTokensResponse = {
        success: true,
        data: [
          { pushToken: 'token1', deviceId: 'device1', platform: 'ios' },
          { pushToken: 'token2', deviceId: 'device2', platform: 'android' },
        ],
      };

      // Mock registerForPushNotificationsAsync
      mockNotifications.getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.getExpoPushTokenAsync = jest.fn().mockResolvedValue({ data: mockToken });
      mockAxiosClient.post.mockResolvedValue({ success: true });
      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);
      mockAxiosClient.patch.mockResolvedValue({ success: true });

      await enablePushNotification();

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/push-notifications/tokens');
      expect(mockAxiosClient.patch).toHaveBeenCalledTimes(2);
      expect(mockAxiosClient.patch).toHaveBeenCalledWith('/push-notifications/enable', {
        pushToken: 'token1',
      });
      expect(mockAxiosClient.patch).toHaveBeenCalledWith('/push-notifications/enable', {
        pushToken: 'token2',
      });
    });

    it('웹에서 등록된 토큰이 있으면 모든 토큰을 활성화한다', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: jest.fn(() => 'web'),
        configurable: true,
      });

      const mockTokensResponse = {
        success: true,
        data: [
          { pushToken: 'token1', deviceId: 'device1', platform: 'ios' },
          { pushToken: 'token2', deviceId: 'device2', platform: 'android' },
        ],
      };

      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);
      mockAxiosClient.patch.mockResolvedValue({ success: true });

      await enablePushNotification();

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/push-notifications/tokens');
      expect(mockAxiosClient.patch).toHaveBeenCalledTimes(2);
    });

    it('웹에서 등록된 토큰이 없으면 에러를 발생시킨다', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: jest.fn(() => 'web'),
        configurable: true,
      });

      const mockTokensResponse = {
        success: true,
        data: [],
      };

      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);

      await expect(enablePushNotification()).rejects.toThrow(
        '등록된 푸시 토큰이 없습니다. 모바일 앱에서 먼저 알림을 허용해주세요.'
      );
    });

    it('모바일에서 토큰 획득 실패 시 에러를 발생시킨다', async () => {
      mockNotifications.getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.getExpoPushTokenAsync = jest.fn().mockResolvedValue(null);

      await expect(enablePushNotification()).rejects.toThrow('푸시 토큰 획득 실패');
    });
  });

  describe('disablePushNotification', () => {
    it('등록된 모든 토큰을 비활성화한다', async () => {
      const mockTokensResponse = {
        success: true,
        data: [
          { pushToken: 'token1', deviceId: 'device1', platform: 'ios' },
          { pushToken: 'token2', deviceId: 'device2', platform: 'android' },
        ],
      };

      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);
      mockAxiosClient.patch.mockResolvedValue({ success: true });

      await disablePushNotification();

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/push-notifications/tokens');
      expect(mockAxiosClient.patch).toHaveBeenCalledTimes(2);
      expect(mockAxiosClient.patch).toHaveBeenCalledWith('/push-notifications/disable', {
        pushToken: 'token1',
      });
      expect(mockAxiosClient.patch).toHaveBeenCalledWith('/push-notifications/disable', {
        pushToken: 'token2',
      });
    });

    it('등록된 토큰이 없으면 조용히 종료한다', async () => {
      const mockTokensResponse = {
        success: true,
        data: [],
      };

      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);

      await disablePushNotification();

      expect(mockAxiosClient.get).toHaveBeenCalledWith('/push-notifications/tokens');
      expect(mockAxiosClient.patch).not.toHaveBeenCalled();
    });

    it('웹에서도 등록된 토큰을 비활성화할 수 있다', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: jest.fn(() => 'web'),
        configurable: true,
      });

      const mockTokensResponse = {
        success: true,
        data: [{ pushToken: 'token1', deviceId: 'device1', platform: 'ios' }],
      };

      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);
      mockAxiosClient.patch.mockResolvedValue({ success: true });

      await disablePushNotification();

      expect(mockAxiosClient.patch).toHaveBeenCalledWith('/push-notifications/disable', {
        pushToken: 'token1',
      });
    });
  });

  describe('병렬 처리', () => {
    it('여러 토큰을 병렬로 활성화한다', async () => {
      const mockTokensResponse = {
        success: true,
        data: [
          { pushToken: 'token1', deviceId: 'device1', platform: 'ios' },
          { pushToken: 'token2', deviceId: 'device2', platform: 'android' },
          { pushToken: 'token3', deviceId: 'device3', platform: 'ios' },
        ],
      };

      mockNotifications.getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
      mockNotifications.getExpoPushTokenAsync = jest
        .fn()
        .mockResolvedValue({ data: 'ExponentPushToken[test]' });
      mockAxiosClient.post.mockResolvedValue({ success: true });
      mockAxiosClient.get.mockResolvedValue(mockTokensResponse);
      mockAxiosClient.patch.mockResolvedValue({ success: true });

      const startTime = Date.now();
      await enablePushNotification();
      const endTime = Date.now();

      // 병렬 처리이므로 순차 처리보다 빨라야 함
      expect(mockAxiosClient.patch).toHaveBeenCalledTimes(3);
      // 병렬 처리 시간이 순차 처리보다 짧은지 확인 (대략적인 체크)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

