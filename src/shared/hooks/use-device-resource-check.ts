import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from './use-modal';
import { useToast } from './use-toast';
import {
  checkDeviceStorage,
  formatStorageSize,
  type DeviceStorageInfo,
} from '../libs/device-check';
import { memoryWarningManager } from '../libs/memory-warning';

export interface DeviceResourceCheckResult {
  storage: DeviceStorageInfo;
  hasMemoryWarning: boolean;
  canProceed: boolean;
}

export interface UseDeviceResourceCheckReturn {
  isChecking: boolean;
  lastCheckResult: DeviceResourceCheckResult | null;
  checkBeforeImagePick: () => Promise<boolean>;
  checkStorageOnly: () => Promise<DeviceStorageInfo>;
  hasRecentMemoryWarning: () => boolean;
}

export const useDeviceResourceCheck = (): UseDeviceResourceCheckReturn => {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { emitToast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<DeviceResourceCheckResult | null>(null);

  const hasRecentMemoryWarning = useCallback((): boolean => {
    return memoryWarningManager.hasRecentMemoryWarning();
  }, []);

  const checkStorageOnly = useCallback(async (): Promise<DeviceStorageInfo> => {
    setIsChecking(true);
    try {
      return await checkDeviceStorage();
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkBeforeImagePick = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const hasMemoryWarning = memoryWarningManager.hasRecentMemoryWarning();

      if (hasMemoryWarning) {
        setLastCheckResult({
          storage: {
            hasEnoughStorage: true,
            freeSpaceBytes: 0,
            freeSpaceMB: 0,
            requiredSpaceMB: 50,
          },
          hasMemoryWarning: true,
          canProceed: false,
        });

        emitToast(t('device.memory.toast', '⚠️ 메모리가 부족해요'));

        showModal({
          title: t('device.memory.warning_title', '메모리 부족'),
          description: t(
            'device.memory.warning_description',
            '기기의 메모리가 부족합니다.\n다른 앱을 종료하고 다시 시도해주세요.'
          ),
          primaryButton: {
            text: t('common.confirm', '확인'),
            onClick: () => {},
          },
        });
        return false;
      }

      const storageInfo = await checkDeviceStorage();

      setLastCheckResult({
        storage: storageInfo,
        hasMemoryWarning: false,
        canProceed: storageInfo.hasEnoughStorage,
      });

      if (!storageInfo.hasEnoughStorage) {
        emitToast(t('device.storage.toast', '⚠️ 저장 공간이 부족해요'));

        showModal({
          title: t('device.storage.insufficient_title', '저장 공간 부족'),
          description: t(
            'device.storage.insufficient_description',
            '사진을 저장하려면 최소 {{required}}MB의 공간이 필요합니다.\n현재 사용 가능: {{available}}',
            {
              required: storageInfo.requiredSpaceMB,
              available: formatStorageSize(storageInfo.freeSpaceBytes),
            }
          ),
          primaryButton: {
            text: t('common.confirm', '확인'),
            onClick: () => {},
          },
        });
        return false;
      }

      return true;
    } finally {
      setIsChecking(false);
    }
  }, [showModal, t]);

  return {
    isChecking,
    lastCheckResult,
    checkBeforeImagePick,
    checkStorageOnly,
    hasRecentMemoryWarning,
  };
};
