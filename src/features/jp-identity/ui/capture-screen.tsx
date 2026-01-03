/**
 * 화면 B: 촬영 가이드 + 카메라 화면
 * 문서 촬영을 위한 카메라 인터페이스
 *
 * API 스펙:
 * - GET /jp/identity/guide/:documentType → { title, description, tips[], prohibitedInfo[] }
 */

import { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text, Button } from '@/src/shared/ui';
import { useJpIdentityGuide } from '../queries';
import type { JpDocumentType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_FRAME_WIDTH = SCREEN_WIDTH - 48;
const CARD_FRAME_HEIGHT = CARD_FRAME_WIDTH / 1.586;

interface CaptureScreenProps {
  documentType: JpDocumentType;
  onCapture: (imageBase64: string) => void;
  onBack: () => void;
}

const CaptureScreen = ({
  documentType,
  onCapture,
  onBack,
}: CaptureScreenProps) => {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const { data: guideData, isLoading: isGuideLoading } =
    useJpIdentityGuide(documentType);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (photo?.base64) {
        console.log('[Capture] base64 length:', photo.base64.length);
        console.log('[Capture] starts with data:', photo.base64.startsWith('data:'));
        onCapture(photo.base64);
      }
    } catch (error) {
      console.error('Failed to capture:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        const base64 = result.assets[0].base64;
        console.log('[Gallery] base64 length:', base64.length);
        console.log('[Gallery] starts with data:', base64.startsWith('data:'));
        console.log('[Gallery] preview:', base64.substring(0, 50));
        onCapture(base64);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={semanticColors.brand.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionIconText}>📷</Text>
        </View>
        <Text style={styles.permissionTitle}>
          {t('features.jp-identity.capture.permission.title')}
        </Text>
        <Text style={styles.permissionDescription}>
          {t('features.jp-identity.capture.permission.description')}
        </Text>
        <Button onPress={requestPermission} style={styles.permissionButton}>
          {t('features.jp-identity.capture.permission.button')}
        </Button>
      </View>
    );
  }

  const tips = guideData?.tips || [
    t('features.jp-identity.capture.tips.bright'),
    t('features.jp-identity.capture.tips.clear'),
    t('features.jp-identity.capture.tips.corners'),
  ];

  const prohibitedInfo = guideData?.prohibitedInfo || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {guideData?.title ||
            t(
              documentType === 'HEALTH_INSURANCE'
                ? 'features.jp-identity.document.health_insurance.title'
                : 'features.jp-identity.document.drivers_license.title'
            )}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.overlay}>
            <View style={styles.overlayTop}>
              <Text style={styles.guideText}>
                {t('features.jp-identity.capture.guide_text')}
              </Text>
            </View>
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.cardFrame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                <View style={styles.cardLabel}>
                  <Text style={styles.cardLabelText}>📇</Text>
                </View>
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>
        </CameraView>
      </View>

      <View style={styles.guideContainer}>
        {isGuideLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>
                {t('features.jp-identity.capture.tips.title')}
              </Text>
              <View style={styles.tipsList}>
                {tips.map((tip, index) => (
                  <Text key={index} style={styles.tipItem}>
                    💡 {tip}
                  </Text>
                ))}
              </View>
            </View>

            {prohibitedInfo.length > 0 && (
              <View style={styles.hideSection}>
                <Text style={styles.hideTitle}>
                  ⚠️ {t('features.jp-identity.capture.hide.title')}
                </Text>
                <Text style={styles.hideItems}>
                  {prohibitedInfo.join(', ')}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={handlePickImage} style={styles.galleryButton}>
          <Text style={styles.galleryButtonText}>🖼</Text>
        </Pressable>

        <Pressable
          onPress={handleCapture}
          disabled={isCapturing}
          style={[
            styles.captureButton,
            isCapturing && styles.captureButtonDisabled,
          ]}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </Pressable>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: semanticColors.surface.background,
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionIconText: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: semanticColors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: CARD_FRAME_HEIGHT + 20,
    alignItems: 'center',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardFrame: {
    width: CARD_FRAME_WIDTH,
    height: CARD_FRAME_HEIGHT,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    opacity: 0.3,
  },
  cardLabelText: {
    fontSize: 40,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  guideContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    minHeight: 120,
  },
  tipsSection: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  hideSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  hideTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: '#FFD60A',
    marginBottom: 4,
  },
  hideItems: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
});

export default CaptureScreen;
