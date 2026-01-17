import axiosClient from '@/src/shared/libs/axios';
import type {
  ContactBlockSettings,
  ContactSyncResult,
  ContactSyncRequest,
  BlockedContactsResponse,
  UnblockContactsResponse,
} from '../types';

export const contactBlockApi = {
  syncContacts(request: ContactSyncRequest): Promise<ContactSyncResult> {
    return axiosClient.post('/v1/matching/contact-block/sync', request);
  },

  getSettings(): Promise<ContactBlockSettings> {
    return axiosClient.get('/v1/matching/contact-block/settings');
  },

  updateSettings(settings: { enabled: boolean }): Promise<void> {
    return axiosClient.patch('/v1/matching/contact-block/settings', settings);
  },

  getBlockedContacts(params: { page: number; limit: number }): Promise<BlockedContactsResponse> {
    return axiosClient.get('/v1/matching/contact-block/contacts', { params });
  },

  unblockContacts(ids: string[]): Promise<UnblockContactsResponse> {
    return axiosClient.patch('/v1/matching/contact-block/contacts', { ids });
  },
};
