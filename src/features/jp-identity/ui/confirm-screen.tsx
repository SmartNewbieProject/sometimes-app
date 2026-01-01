/**
 * 화면 B-3: 제출 확인 화면
 * 촬영된 이미지 확인 및 최종 제출
 *
 * API 스펙:
 * - POST /jp/identity/validate-image → { valid, errors[], warnings[] }
 * - POST /jp/identity/submit → { verified, message }
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text, Button } from '@/src/shared/ui';
import { useValidateIdentityImage, useSubmitIdentity } from '../queries';
import type { JpDocumentType, JpIdentityValidateResponse } from '../types';

interface ConfirmScreenProps {
  documentType: JpDocumentType;
  imageBase64: string;
  onRetake: () => void;
  onSuccess: (verified: boolean) => void;
}

const ConfirmScreen = ({
  documentType,
  imageBase64,
  onRetake,
  onSuccess,
}: ConfirmScreenProps) => {
  const { t } = useTranslation();
  const [validationResult, setValidationResult] =
    useState<JpIdentityValidateResponse | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const validateMutation = useValidateIdentityImage();
  const submitMutation = useSubmitIdentity();

  useEffect(() => {
    console.log('ConfirmScreen mounted');
    console.log('imageBase64 length:', imageBase64?.length);
    console.log('imageBase64 preview:', imageBase64?.substring(0, 100) + '...');
    console.log('Has data URI prefix:', imageBase64?.startsWith('data:'));
    handleValidate();
  }, []);

  const handleValidate = async () => {
    try {
      const pureBase64Value = imageBase64?.startsWith('data:')
        ? imageBase64.split(',')[1]
        : imageBase64;

      console.log('[Validate] Sending base64 length:', pureBase64Value?.length);
      console.log('[Validate] Starts with data:', pureBase64Value?.startsWith('data:'));

      const result = await validateMutation.mutateAsync({
        documentType,
        imageBase64: pureBase64Value,
      });
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [t('features.jp-identity.confirm.validation_error')],
        warnings: [],
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const pureBase64Value = imageBase64?.startsWith('data:')
        ? imageBase64.split(',')[1]
        : imageBase64;

      console.log('[Submit] Sending base64 length:', pureBase64Value?.length);

      const result = await submitMutation.mutateAsync({
        documentType,
        imageBase64: pureBase64Value,
      });
      onSuccess(result.verified);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [t('features.jp-identity.confirm.submit_error')],
        warnings: [],
      });
    }
  };

  const isValidating = validateMutation.isPending;
  const isSubmitting = submitMutation.isPending;
  const isValid = validationResult?.valid;
  const hasErrors = validationResult && validationResult.errors.length > 0;
  const hasWarnings = validationResult && validationResult.warnings.length > 0;

  const imageUri = imageBase64?.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('features.jp-identity.confirm.title')}
        </Text>
        <Text style={styles.subtitle}>
          {t('features.jp-identity.confirm.subtitle')}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {imageLoadError ? (
          <View style={styles.imageErrorContainer}>
            <Text style={styles.imageErrorIcon}>⚠️</Text>
            <Text style={styles.imageErrorText}>
              画像の読み込みに失敗しました
            </Text>
            <Text style={styles.imageErrorSubtext}>
              再撮影してください
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              !isValid && validationResult && styles.imageError,
            ]}
            resizeMode="contain"
            onError={(error) => {
              console.error('Image load error:', error);
              console.error('Failed URI:', imageUri?.substring(0, 100));
              setImageLoadError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
            }}
          />
        )}
        {isValidating && (
          <View style={styles.validatingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.validatingText}>
              {t('features.jp-identity.confirm.validating')}
            </Text>
          </View>
        )}
      </View>

      {validationResult && (
        <View
          style={[
            styles.resultContainer,
            isValid ? styles.resultSuccess : styles.resultError,
          ]}
        >
          <Text style={styles.resultIcon}>{isValid ? '✅' : '⚠️'}</Text>
          <View style={styles.resultTextContainer}>
            <Text
              style={[
                styles.resultTitle,
                !isValid ? styles.resultTitleError : {},
              ]}
            >
              {isValid
                ? t('features.jp-identity.confirm.valid')
                : t('features.jp-identity.confirm.invalid')}
            </Text>

            {hasErrors &&
              validationResult.errors.map((error, index) => (
                <Text key={`error-${index}`} style={styles.errorText}>
                  • {error}
                </Text>
              ))}

            {hasWarnings &&
              validationResult.warnings.map((warning, index) => (
                <Text key={`warning-${index}`} style={styles.warningText}>
                  ⚠ {warning}
                </Text>
              ))}
          </View>
        </View>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('features.jp-identity.confirm.document_type')}
          </Text>
          <Text style={styles.infoValue}>
            {t(
              documentType === 'HEALTH_INSURANCE'
                ? 'features.jp-identity.document.health_insurance.title'
                : 'features.jp-identity.document.drivers_license.title'
            )}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {isValid && (
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.primaryButton}
          >
            {isSubmitting
              ? t('features.jp-identity.confirm.submitting')
              : t('features.jp-identity.confirm.submit_button')}
          </Button>
        )}

        <Pressable
          onPress={onRetake}
          style={[styles.retakeButton, !isValid && styles.retakeButtonPrimary]}
        >
          <Text
            style={[
              styles.retakeButtonText,
              !isValid ? styles.retakeButtonTextPrimary : {},
            ]}
          >
            {t('features.jp-identity.confirm.retake_button')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: semanticColors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  imageContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F5',
    marginBottom: 20,
  },
  image: {
    flex: 1,
  },
  imageError: {
    opacity: 0.4,
  },
  imageErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageErrorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  imageErrorText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  imageErrorSubtext: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  validatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    marginTop: 12,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultSuccess: {
    backgroundColor: '#E8F8F0',
    borderWidth: 1,
    borderColor: '#6DD69C',
  },
  resultError: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: 4,
  },
  resultTitleError: {
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#FF3B30',
    lineHeight: 20,
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#FF9500',
    lineHeight: 20,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 'auto',
  },
  primaryButton: {
    width: '100%',
  },
  retakeButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButtonPrimary: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 12,
  },
  retakeButtonText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.secondary,
  },
  retakeButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export default ConfirmScreen;
