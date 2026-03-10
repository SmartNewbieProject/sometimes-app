import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState, Platform } from 'react-native';
import { usePushNotification } from '@/src/features/mypage/hooks/use-push-notification';
import * as notifications from '@/src/shared/libs/notifications';
import { useModal } from '@/src/shared/hooks/use-modal';

// Mock Alert before other imports
const mockAlert = jest.fn();

// Mock dependencies
jest.mock('@/src/shared/libs/notifications');
jest.mock('@/src/shared/hooks/use-modal');
jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko' },
  }),
}));
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  __esModule: true,
  default: {
    alert: mockAlert,
  },
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  __esModule: true,
  default: {
    openSettings: jest.fn(),
  },
}));

describe('usePushNotification Hook', () => {
  const mockNotifications = notifications as jest.Mocked<typeof notifications>;
  const mockUseModal = useModal as jest.MockedFunction<typeof useModal>;
  const mockShowModal = jest.fn();
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    addEventListenerSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as any);
    mockUseModal.mockReturnValue({
      showModal: mockShowModal,
      showErrorModal: jest.fn(),
      showNestedErrorModal: jest.fn(),
      showNestedModal: jest.fn(),
      hideModal: jest.fn(),
      hideNestedModal: jest.fn(),
    });

    // Reset Platform.OS to default
    Object.defineProperty(Platform, 'OS', {
      get: jest.fn(() => 'ios'),
      configurable: true,
    });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  describe('초기 상태', () => {
    it('초기 로딩 상태에서 시작한다', () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });

      const { result } = renderHook(() => usePushNotification());

      expect(result.current.isLoading).toBe(true);
    });

    it('마운트 시 푸시 알림 상태를 조회한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: true,
        tokenCount: 2,
        activeTokenCount: 1,
      });
      mockNotifications.checkNotificationPermissionStatus.mockResolvedValue('granted' as any);

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNotifications.getPushNotificationStatus).toHaveBeenCalled();
      expect(result.current.isEnabled).toBe(true);
    });
  });

  describe('토글 활성화', () => {
    it('모바일에서 권한이 있으면 푸시 알림을 활성화한다', async () => {
      mockNotifications.getPushNotificationStatus
        .mockResolvedValueOnce({
          isEnabled: false,
          tokenCount: 0,
          activeTokenCount: 0,
        })
        .mockResolvedValueOnce({
          isEnabled: true,
          tokenCount: 1,
          activeTokenCount: 1,
        });
      mockNotifications.requestNotificationPermission.mockResolvedValue('granted' as any);
      mockNotifications.checkNotificationPermissionStatus.mockResolvedValue('granted' as any);
      mockNotifications.enablePushNotification.mockResolvedValue();

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });
      expect(mockNotifications.enablePushNotification).toHaveBeenCalled();
    });

    it('모바일에서 권한이 없으면 설정 열기 Alert를 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.requestNotificationPermission.mockResolvedValue('denied' as any);

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'features.mypage.notification.permission_required_title',
        'features.mypage.notification.permission_required_message',
        expect.any(Array)
      );
      expect(mockNotifications.enablePushNotification).not.toHaveBeenCalled();
    });

    it('웹에서 등록된 토큰이 없으면 안내 모달을 표시한다', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: jest.fn(() => 'web'),
        configurable: true,
      });

      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.enablePushNotification.mockRejectedValue(new Error('NO_PUSH_TOKEN_REGISTERED'));

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: 'features.mypage.notification.activation_failed_title',
        children: expect.objectContaining({
          props: expect.objectContaining({
            children: 'common.푸시_토큰_획득_실패',
          }),
        }),
        primaryButton: {
          text: 'features.mypage.notification.confirm',
          onClick: expect.any(Function),
        },
      });
    });

    it('활성화 실패 시 에러 모달을 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.requestNotificationPermission.mockResolvedValue('granted' as any);
      mockNotifications.enablePushNotification.mockRejectedValue(new Error('네트워크 오류'));

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: 'features.mypage.notification.activation_failed_title',
        children: expect.objectContaining({
          props: expect.objectContaining({
            children: '네트워크 오류',
          }),
        }),
        primaryButton: {
          text: 'features.mypage.notification.confirm',
          onClick: expect.any(Function),
        },
      });
    });
  });

  describe('토글 비활성화', () => {
    it('푸시 알림을 비활성화한다', async () => {
      mockNotifications.getPushNotificationStatus
        .mockResolvedValue({
          isEnabled: true,
          tokenCount: 1,
          activeTokenCount: 1,
        });
      mockNotifications.checkNotificationPermissionStatus.mockResolvedValue('granted' as any);
      mockNotifications.disablePushNotification.mockResolvedValue();

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEnabled).toBe(true);

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockNotifications.disablePushNotification).toHaveBeenCalled();
      expect(result.current.isEnabled).toBe(false);
    });

    it('비활성화 실패 시 에러 모달을 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: true,
        tokenCount: 1,
        activeTokenCount: 1,
      });
      mockNotifications.checkNotificationPermissionStatus.mockResolvedValue('granted' as any);
      mockNotifications.disablePushNotification.mockRejectedValue(new Error('서버 오류'));

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: 'features.mypage.notification.deactivation_failed_title',
        children: 'features.mypage.notification.deactivation_failed_message',
        primaryButton: {
          text: 'features.mypage.notification.confirm',
          onClick: expect.any(Function),
        },
      });
    });
  });

  describe('refetch', () => {
    it('상태를 다시 조회한다', async () => {
      mockNotifications.getPushNotificationStatus
        .mockResolvedValueOnce({
          isEnabled: false,
          tokenCount: 0,
          activeTokenCount: 0,
        })
        .mockResolvedValueOnce({
          isEnabled: true,
          tokenCount: 1,
          activeTokenCount: 1,
        });
      mockNotifications.checkNotificationPermissionStatus.mockResolvedValue('granted' as any);

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEnabled).toBe(false);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.isEnabled).toBe(true);
      expect(mockNotifications.getPushNotificationStatus).toHaveBeenCalledTimes(2);
    });
  });
});
