import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markAsRead,
  markAllAsRead,
  markAsReadBatch,
  deleteNotification,
  deleteAllRead,
  deleteNotificationsBatch,
} from '../apis';
import { useModal } from '@/src/shared/hooks/use-modal';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Mark notification as read error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "알림 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Mark all notifications as read error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "전체 알림 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};

export const useMarkAsReadBatch = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: markAsReadBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Batch mark as read error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "선택한 알림 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Delete notification error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "알림 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};

export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: deleteAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Delete all read notifications error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "읽은 알림 전체 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};

export const useDeleteNotificationsBatch = () => {
  const queryClient = useQueryClient();
  const { showErrorModal } = useModal();

  return useMutation({
    mutationFn: deleteNotificationsBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'read-count'] });
    },
    onError: (error: any) => {
      console.error("Batch delete notifications error:", {
        error,
        errorMessage: error?.message,
        errorString: error?.error,
        status: error?.status,
        statusCode: error?.statusCode,
      });

      const errorMessage = error?.message || error?.error || "선택한 알림 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
      showErrorModal(errorMessage, 'error');
    },
  });
};