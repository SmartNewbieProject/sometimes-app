/**
 * 화면 A: 문서 타입 선택 화면
 * 건강보험증 또는 운전면허증 선택
 */

import { StyleSheet, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import type { JpDocumentType } from '../types';

interface DocumentSelectScreenProps {
  onSelect: (documentType: JpDocumentType) => void;
}

const DOCUMENT_OPTIONS: Array<{
  type: JpDocumentType;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}> = [
  {
    type: 'HEALTH_INSURANCE',
    icon: '📋',
    titleKey: 'features.jp-identity.document.health_insurance.title',
    descriptionKey: 'features.jp-identity.document.health_insurance.description',
  },
  {
    type: 'DRIVERS_LICENSE',
    icon: '🚗',
    titleKey: 'features.jp-identity.document.drivers_license.title',
    descriptionKey: 'features.jp-identity.document.drivers_license.description',
  },
];

const DocumentSelectScreen = ({ onSelect }: DocumentSelectScreenProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.mainIcon}>🔐</Text>
        </View>
        <Text style={styles.title}>
          {t('features.jp-identity.select.title')}
        </Text>
        <Text style={styles.subtitle}>
          {t('features.jp-identity.select.subtitle')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {DOCUMENT_OPTIONS.map((option) => (
          <Pressable
            key={option.type}
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => onSelect(option.type)}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>{option.icon}</Text>
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
              <Text style={styles.optionDescription}>
                {t(option.descriptionKey)}
              </Text>
            </View>
            <View style={styles.optionArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.noticeContainer}>
        <View style={styles.noticeIcon}>
          <Text style={styles.noticeIconText}>🔒</Text>
        </View>
        <Text style={styles.noticeText}>
          {t('features.jp-identity.select.notice')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: semanticColors.border?.default || '#E5E5E5',
  },
  optionCardPressed: {
    backgroundColor: '#F0F0F5',
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconText: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.muted,
    lineHeight: 18,
  },
  optionArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: semanticColors.text.muted,
    fontWeight: '300',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
  },
  noticeIcon: {
    marginRight: 12,
  },
  noticeIconText: {
    fontSize: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    lineHeight: 20,
  },
});

export default DocumentSelectScreen;
