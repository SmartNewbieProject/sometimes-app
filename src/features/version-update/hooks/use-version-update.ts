import {useState, useEffect, useCallback} from 'react';
import {useLatestVersionQuery} from '../queries';
import {compareVersions} from '@/src/shared/libs/version-utils';
import {VersionUpdateResponse} from '../types';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import {useStorage} from '@/src/shared/hooks/use-storage';

const SKIPPED_VERSION_KEY = 'skipped_version';

export const useVersionUpdate = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState<VersionUpdateResponse | null>(null);

  const {data: latestVersionData, isLoading} = useLatestVersionQuery();
  const {value: skippedVersion, setValue: setSkippedVersion, loading: skippedVersionLoading} = useStorage<string>({
    key: SKIPPED_VERSION_KEY,
  });
  const serverVersion = latestVersionData?.version;
  const currentVersion = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';

  const checkForUpdate = useCallback(async () => {
    if (!latestVersionData || !serverVersion) return;
    if (skippedVersion === serverVersion && !latestVersionData.shouldUpdate) {
      return;
    }
    const needsUpdate = compareVersions(currentVersion, serverVersion);

    if (needsUpdate) {
      setUpdateData(latestVersionData);
      setShowUpdateModal(true);
    }
  }, [latestVersionData, skippedVersion]);

  const skipVersion = useCallback(async () => {
    if (updateData && !updateData.shouldUpdate) {
      await setSkippedVersion(updateData.version);
      setShowUpdateModal(false);
      setUpdateData(null);
    }
  }, [updateData, setSkippedVersion]);

  const closeModal = () => {
    if (updateData && !updateData.shouldUpdate) {
      setShowUpdateModal(false);
      setUpdateData(null);
    }
  };

  useEffect(() => {
    if (skippedVersionLoading || isLoading) return;
    if (skippedVersion && skippedVersion === serverVersion) return;

    if (serverVersion) {
      checkForUpdate();
    }
  }, [isLoading, skippedVersionLoading, latestVersionData, skippedVersion, serverVersion]);

  return {
    showUpdateModal,
    updateData,
    skipVersion,
    closeModal,
    isLoading,
    serverVersion,
    currentVersion,
  };
};