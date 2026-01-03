/**
 * JP Identity Verification 메인 컨테이너
 * 상태에 따라 적절한 화면을 렌더링합니다.
 */

import { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useJpIdentityStatus } from '../queries';
import type { JpDocumentType, JpIdentityStep } from '../types';
import DocumentSelectScreen from './document-select-screen';
import CaptureScreen from './capture-screen';
import ConfirmScreen from './confirm-screen';
import { PendingScreen, RejectedScreen, ApprovedScreen } from './status-screens';

const JpIdentityContainer = () => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useJpIdentityStatus();

  const [step, setStep] = useState<JpIdentityStep>('SELECT_DOCUMENT');
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<JpDocumentType | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleSelectDocument = useCallback((documentType: JpDocumentType) => {
    setSelectedDocumentType(documentType);
    setStep('CAPTURE');
  }, []);

  const handleCapture = useCallback((imageBase64: string) => {
    setCapturedImage(imageBase64);
    setStep('CONFIRM');
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setStep('CAPTURE');
  }, []);

  const handleBackToSelect = useCallback(() => {
    setSelectedDocumentType(null);
    setCapturedImage(null);
    setStep('SELECT_DOCUMENT');
  }, []);

  const handleSubmitSuccess = useCallback(
    (verified: boolean) => {
      refetch();
      if (verified) {
        setStep('APPROVED');
      } else {
        setStep('PENDING');
      }
    },
    [refetch]
  );

  const handleResubmit = useCallback(() => {
    setSelectedDocumentType(null);
    setCapturedImage(null);
    setStep('SELECT_DOCUMENT');
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={semanticColors.brand.primary} />
      </View>
    );
  }

  if (data?.status === 'PENDING' || data?.status === 'MANUAL_REVIEW') {
    return <PendingScreen data={data} />;
  }

  if (data?.status === 'REJECTED') {
    return <RejectedScreen data={data} onResubmit={handleResubmit} />;
  }

  if (data?.status === 'APPROVED') {
    return <ApprovedScreen />;
  }

  switch (step) {
    case 'SELECT_DOCUMENT':
      return <DocumentSelectScreen onSelect={handleSelectDocument} />;

    case 'CAPTURE':
      return (
        <CaptureScreen
          documentType={selectedDocumentType!}
          onCapture={handleCapture}
          onBack={handleBackToSelect}
        />
      );

    case 'CONFIRM':
      return (
        <ConfirmScreen
          documentType={selectedDocumentType!}
          imageBase64={capturedImage!}
          onRetake={handleRetake}
          onSuccess={handleSubmitSuccess}
        />
      );

    case 'PENDING':
      return <PendingScreen data={data!} />;

    case 'APPROVED':
      return <ApprovedScreen />;

    default:
      return <DocumentSelectScreen onSelect={handleSelectDocument} />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.background,
  },
});

export default JpIdentityContainer;
