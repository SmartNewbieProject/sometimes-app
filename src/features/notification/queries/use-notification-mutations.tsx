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
    onError: (error) => {
      showErrorModal(error, 'error');
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
    onError: (error) => {
      showErrorModal(error, 'error');
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
    onError: (error) => {
      showErrorModal(error, 'error');
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
    onError: (error) => {
      showErrorModal(error, 'error');
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
    onError: (error) => {
      showErrorModal(error, 'error');
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
    onError: (error) => {
      showErrorModal(error, 'error');
    },
  });
};