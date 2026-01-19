export interface ContactBlockSettings {
  enabled: boolean;
  syncedContactCount: number;
  matchedUserCount: number;
}

export interface ContactSyncResult {
  matchedCount: number;
  totalSynced: number;
  syncedAt: string;
}

export interface ContactItem {
  name: string;
  phoneNumber: string;
}

export interface ContactSyncRequest {
  contacts: ContactItem[];
}

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
}

export type ContactPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface BlockedContact {
  id: string;
  phoneHash: string;
  createdAt: string;
  name: string | null;
  phoneNumber: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface BlockedContactsResponse {
  items: BlockedContact[];
  meta: PaginationMeta;
}

export interface UnblockContactsRequest {
  ids: string[];
}

export interface UnblockContactsResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}
