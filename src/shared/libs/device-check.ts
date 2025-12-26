import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const MIN_REQUIRED_STORAGE_MB = 50;
const MIN_REQUIRED_STORAGE_BYTES = MIN_REQUIRED_STORAGE_MB * 1024 * 1024;

export interface DeviceStorageInfo {
  hasEnoughStorage: boolean;
  freeSpaceBytes: number;
  freeSpaceMB: number;
  requiredSpaceMB: number;
}

export const checkDeviceStorage = async (): Promise<DeviceStorageInfo> => {
  if (Platform.OS === 'web') {
    return {
      hasEnoughStorage: true,
      freeSpaceBytes: Number.MAX_SAFE_INTEGER,
      freeSpaceMB: Number.MAX_SAFE_INTEGER,
      requiredSpaceMB: MIN_REQUIRED_STORAGE_MB,
    };
  }

  try {
    const freeSpaceBytes = await FileSystem.getFreeDiskStorageAsync();
    const freeSpaceMB = Math.floor(freeSpaceBytes / (1024 * 1024));

    return {
      hasEnoughStorage: freeSpaceBytes > MIN_REQUIRED_STORAGE_BYTES,
      freeSpaceBytes,
      freeSpaceMB,
      requiredSpaceMB: MIN_REQUIRED_STORAGE_MB,
    };
  } catch {
    return {
      hasEnoughStorage: true,
      freeSpaceBytes: Number.MAX_SAFE_INTEGER,
      freeSpaceMB: Number.MAX_SAFE_INTEGER,
      requiredSpaceMB: MIN_REQUIRED_STORAGE_MB,
    };
  }
};

export const formatStorageSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  }
  return `${(bytes / 1024).toFixed(0)}KB`;
};
