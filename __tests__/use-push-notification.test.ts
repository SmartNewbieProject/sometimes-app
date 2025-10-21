import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { usePushNotification } from '@/src/features/mypage/hooks/use-push-notification';
import * as notifications from '@/src/shared/libs/notifications';
import { useModal } from '@/src/shared/hooks/use-modal';

// Mock Alert before other imports
const mockAlert = jest.fn();

// Mock dependencies
jest.mock('@/src/shared/libs/notifications');
jest.mock('@/src/shared/hooks/use-modal');
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
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
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.getNotificationPermissionStatus.mockResolvedValue('granted' as any);
      mockNotifications.enablePushNotification.mockResolvedValue();

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockNotifications.enablePushNotification).toHaveBeenCalled();
    });

    it('모바일에서 권한이 없으면 설정 열기 Alert를 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.getNotificationPermissionStatus.mockResolvedValue('denied' as any);

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockAlert).toHaveBeenCalledWith(
        '알림 권한 필요',
        '푸시 알림을 받으려면 설정에서 알림을 허용해주세요.',
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
      mockNotifications.enablePushNotification.mockRejectedValue(
        new Error('등록된 푸시 토큰이 없습니다. 모바일 앱에서 먼저 알림을 허용해주세요.')
      );

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: '푸시 알림 등록 필요',
        children: '푸시 알림은 모바일 기기에서만 등록할 수 있습니다.\n모바일 앱에서 먼저 알림을 허용해주세요.',
        primaryButton: { text: '확인', onClick: expect.any(Function) },
      });
    });

    it('활성화 실패 시 에러 모달을 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: false,
        tokenCount: 0,
        activeTokenCount: 0,
      });
      mockNotifications.getNotificationPermissionStatus.mockResolvedValue('granted' as any);
      mockNotifications.enablePushNotification.mockRejectedValue(new Error('네트워크 오류'));

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: '알림 활성화 실패',
        children: '네트워크 오류',
        primaryButton: { text: '확인', onClick: expect.any(Function) },
      });
    });
  });

  describe('토글 비활성화', () => {
    it('푸시 알림을 비활성화한다', async () => {
      mockNotifications.getPushNotificationStatus
        .mockResolvedValueOnce({
          isEnabled: true,
          tokenCount: 1,
          activeTokenCount: 1,
        })
        .mockResolvedValueOnce({
          isEnabled: false,
          tokenCount: 1,
          activeTokenCount: 0,
        });
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
    });

    it('비활성화 실패 시 에러 모달을 표시한다', async () => {
      mockNotifications.getPushNotificationStatus.mockResolvedValue({
        isEnabled: true,
        tokenCount: 1,
        activeTokenCount: 1,
      });
      mockNotifications.disablePushNotification.mockRejectedValue(new Error('서버 오류'));

      const { result } = renderHook(() => usePushNotification());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockShowModal).toHaveBeenCalledWith({
        title: '알림 비활성화 실패',
        children: '푸시 알림 비활성화에 실패했습니다. 다시 시도해주세요.',
        primaryButton: { text: '확인', onClick: expect.any(Function) },
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

