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

export interface ContactSyncRequest {
  phoneNumbers: string[];
}

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
}

export type ContactPermissionStatus = 'granted' | 'denied' | 'undetermined';
