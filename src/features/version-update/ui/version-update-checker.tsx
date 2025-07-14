import React, {useEffect} from 'react';
import {useModal} from '@/src/shared/hooks/use-modal';
import {useVersionUpdate} from '../hooks';
import {UpdateModalContent} from './update-modal-content';

export const VersionUpdateChecker: React.FC = () => {
  const {showModal, hideModal} = useModal();
  const {
    showUpdateModal,
    updateData,
    skipVersion,
    closeModal,
    serverVersion,
    currentVersion
  } = useVersionUpdate();

  useEffect(() => {
    if (showUpdateModal && updateData) {
      const canSkip = !updateData.shouldUpdate;
      showModal({
        children: <UpdateModalContent
            updateData={updateData}
            serverVersion={serverVersion}
            currentVersion={currentVersion}
            canSkip={canSkip}
            onSkip={() => {
              skipVersion();
              closeModal();
              hideModal();
            }}
        />,
      });
    }
  }, [showUpdateModal, updateData, skipVersion]);

  return null;
};