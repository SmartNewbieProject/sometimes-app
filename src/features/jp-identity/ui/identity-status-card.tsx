/**
 * JP Identity Status Card - /my 페이지에 표시되는 본인확인 상태 카드
 * 일본 유저만 보이며, 상태에 따라 다른 UI를 표시합니다.
 */

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { useJpIdentityStatus } from '../queries';
import type { JpIdentityStatus } from '../types';

interface StatusConfig {
  icon: string;
  backgroundColor: string;
  borderColor: string;
  titleKey: string;
  descriptionKey: string;
  actionable: boolean;
  badgeColor?: string;
  badgeTextKey?: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  null: {
    icon: '✨',
    backgroundColor: '#F7F3FF',
    borderColor: '#D4C4F5',
    titleKey: 'features.jp-identity.card.not_verified.title',
    descriptionKey: 'features.jp-identity.card.not_verified.description',
    actionable: true,
    badgeColor: '#7A4AE2',
    badgeTextKey: 'features.jp-identity.card.badge.required',
  },
  PENDING: {
    icon: '⏳',
    backgroundColor: '#F2EDFF',
    borderColor: '#D4C4F5',
    titleKey: 'features.jp-identity.card.pending.title',
    descriptionKey: 'features.jp-identity.card.pending.description',
    actionable: false,
    badgeColor: '#7A4AE2',
    badgeTextKey: 'features.jp-identity.card.badge.reviewing',
  },
  MANUAL_REVIEW: {
    icon: '👤',
    backgroundColor: '#F2EDFF',
    borderColor: '#D4C4F5',
    titleKey: 'features.jp-identity.card.manual_review.title',
    descriptionKey: 'features.jp-identity.card.manual_review.description',
    actionable: false,
    badgeColor: '#A892D7',
    badgeTextKey: 'features.jp-identity.card.badge.manual_review',
  },
  APPROVED: {
    icon: '✅',
    backgroundColor: '#E8F8F0',
    borderColor: '#6DD69C',
    titleKey: 'features.jp-identity.card.approved.title',
    descriptionKey: 'features.jp-identity.card.approved.description',
    actionable: false,
    badgeColor: '#34C759',
    badgeTextKey: 'features.jp-identity.card.badge.verified',
  },
  REJECTED: {
    icon: '❌',
    backgroundColor: '#FFF0F0',
    borderColor: '#FFB3B3',
    titleKey: 'features.jp-identity.card.rejected.title',
    descriptionKey: 'features.jp-identity.card.rejected.description',
    actionable: true,
    badgeColor: '#FF3B30',
    badgeTextKey: 'features.jp-identity.card.badge.rejected',
  },
};

const IdentityStatusCard = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, isLoading, error } = useJpIdentityStatus();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={semanticColors.brand.primary} />
      </View>
    );
  }

  const statusKey = error || !data
    ? 'null'
    : data.status === null
      ? 'null'
      : data.status;
  const config = STATUS_CONFIGS[statusKey] || STATUS_CONFIGS['null'];

  const handlePress = () => {
    if (config.actionable) {
      router.push('/jp-identity' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          {t('features.jp-identity.card.section_title')}
        </Text>
        {config.badgeTextKey && (
          <View style={[styles.badge, { backgroundColor: config.badgeColor }]}>
            <Text style={styles.badgeText}>{t(config.badgeTextKey)}</Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={handlePress}
        disabled={!config.actionable}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
          pressed && config.actionable && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{t(config.titleKey)}</Text>
            <Text style={styles.cardDescription}>
              {data?.status === 'REJECTED' && data.rejectionReason
                ? data.rejectionReason
                : t(config.descriptionKey)}
            </Text>
          </View>
          {config.actionable && (
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          )}
        </View>
        {data?.submittedAt && data.status !== null && (
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              {t('features.jp-identity.card.submitted_at', {
                date: new Date(data.submittedAt).toLocaleDateString('ja-JP'),
              })}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: semanticColors.text.primary,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    lineHeight: 21.6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    color: semanticColors.text.primary,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    lineHeight: 22,
  },
  cardDescription: {
    color: semanticColors.text.secondary,
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 18,
    marginTop: 4,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: semanticColors.text.muted,
    fontWeight: '300',
  },
  metaContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metaText: {
    color: semanticColors.text.muted,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
});

export default IdentityStatusCard;
