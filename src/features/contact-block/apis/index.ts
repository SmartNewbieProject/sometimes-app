import axiosClient from '@/src/shared/libs/axios';
import type {
  ContactBlockSettings,
  ContactSyncResult,
  ContactSyncRequest,
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
};
