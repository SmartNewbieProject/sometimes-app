import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/contact.service';
import { contactBlockApi } from '../apis';
import { useToast } from '@/src/shared/hooks/use-toast';
import type { ContactPermissionStatus, ContactSyncResult } from '../types';

const QUERY_KEYS = {
  settings: ['contact-block', 'settings'],
} as const;

export const useContactBlock = () => {
  const queryClient = useQueryClient();
  const [permissionStatus, setPermissionStatus] = useState<ContactPermissionStatus>('undetermined');
  const { emitToast } = useToast();

  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: contactBlockApi.getSettings,
  });

  const syncMutation = useMutation({
    mutationFn: async (): Promise<ContactSyncResult> => {
      const phoneNumbers = await contactService.getNormalizedPhoneNumbers();
      return contactBlockApi.syncContacts({ phoneNumbers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
    },
    onError: (error: any) => {
      if (error?.status === 429) {
        emitToast('잠시 후 다시 시도해주세요');
      }
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: contactBlockApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
    },
  });

  const requestPermission = useCallback(async (): Promise<ContactPermissionStatus> => {
    const status = await contactService.requestPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const checkPermission = useCallback(async (): Promise<ContactPermissionStatus> => {
    const status = await contactService.checkPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const syncContacts = useCallback(async (): Promise<ContactSyncResult | null> => {
    const status = await checkPermission();

    if (status !== 'granted') {
      const newStatus = await requestPermission();
      if (newStatus !== 'granted') {
        return null;
      }
    }

    return syncMutation.mutateAsync();
  }, [checkPermission, requestPermission, syncMutation]);

  const toggleContactBlock = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const result = await syncContacts();
      if (!result) return null;
    }

    return updateSettingsMutation.mutateAsync({ enabled });
  }, [syncContacts, updateSettingsMutation]);

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isSyncing: syncMutation.isPending,
    isUpdating: updateSettingsMutation.isPending,
    permissionStatus,
    requestPermission,
    checkPermission,
    syncContacts,
    toggleContactBlock,
  };
};
