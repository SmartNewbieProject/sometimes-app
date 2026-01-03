/**
 * 상태별 화면들
 * - 화면 C: 심사 중 (PENDING / MANUAL_REVIEW)
 * - 화면 D: 거절됨 (REJECTED)
 * - 화면 E: 승인 완료 (APPROVED)
 */

import { StyleSheet, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text, Button } from '@/src/shared/ui';
import type { JpIdentityStatusResponse, JpDocumentType } from '../types';

interface StatusScreenProps {
  data: JpIdentityStatusResponse;
  onResubmit?: () => void;
}

/**
 * 화면 C: 심사 중
 */
export const PendingScreen = ({ data }: StatusScreenProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)/home' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, styles.iconCirclePending]}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={styles.title}>
          {t('features.jp-identity.status.pending.title')}
        </Text>

        <Text style={styles.description}>
          {t('features.jp-identity.status.pending.description')}
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('features.jp-identity.status.submitted_at')}
            </Text>
            <Text style={styles.infoValue}>
              {data.submittedAt
                ? new Date(data.submittedAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('features.jp-identity.status.document_type')}
            </Text>
            <Text style={styles.infoValue}>
              {data.documentType === 'HEALTH_INSURANCE'
                ? t('features.jp-identity.document.health_insurance.title')
                : t('features.jp-identity.document.drivers_license.title')}
            </Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>💡</Text>
          <Text style={styles.noticeText}>
            {t('features.jp-identity.status.pending.notice')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleGoHome} variant="secondary">
          {t('features.jp-identity.status.go_home')}
        </Button>
      </View>
    </View>
  );
};

/**
 * 화면 D: 거절됨
 */
export const RejectedScreen = ({ data, onResubmit }: StatusScreenProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, styles.iconCircleRejected]}>
          <Text style={styles.icon}>❌</Text>
        </View>

        <Text style={styles.title}>
          {t('features.jp-identity.status.rejected.title')}
        </Text>

        <Text style={styles.description}>
          {t('features.jp-identity.status.rejected.description')}
        </Text>

        {data.rejectionReason && (
          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>
              {t('features.jp-identity.status.rejected.reason_title')}
            </Text>
            <Text style={styles.reasonText}>{data.rejectionReason}</Text>
          </View>
        )}

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {t('features.jp-identity.status.rejected.help_title')}
          </Text>
          <Text style={styles.helpItem}>
            • {t('features.jp-identity.status.rejected.help_1')}
          </Text>
          <Text style={styles.helpItem}>
            • {t('features.jp-identity.status.rejected.help_2')}
          </Text>
          <Text style={styles.helpItem}>
            • {t('features.jp-identity.status.rejected.help_3')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={onResubmit}>
          {t('features.jp-identity.status.rejected.resubmit')}
        </Button>
        <Pressable style={styles.changeDocButton} onPress={onResubmit}>
          <Text style={styles.changeDocButtonText}>
            {t('features.jp-identity.status.rejected.change_document')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * 화면 E: 승인 완료
 */
export const ApprovedScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleStartChat = () => {
    router.replace('/(tabs)/home' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, styles.iconCircleApproved]}>
          <Text style={styles.icon}>✅</Text>
        </View>

        <Text style={styles.title}>
          {t('features.jp-identity.status.approved.title')}
        </Text>

        <Text style={styles.description}>
          {t('features.jp-identity.status.approved.description')}
        </Text>

        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>
            {t('features.jp-identity.status.approved.celebration')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleStartChat}>
          {t('features.jp-identity.status.approved.start_chat')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCirclePending: {
    backgroundColor: '#F0F4FF',
  },
  iconCircleRejected: {
    backgroundColor: '#FFF0F0',
  },
  iconCircleApproved: {
    backgroundColor: '#E8F8F0',
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  infoCard: {
    width: '100%',
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: semanticColors.border?.default || '#E5E5E5',
    marginVertical: 14,
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
  noticeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    lineHeight: 20,
  },
  reasonCard: {
    width: '100%',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB3B3',
    padding: 16,
    marginBottom: 24,
  },
  reasonTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.primary,
    lineHeight: 20,
  },
  helpCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: 12,
  },
  helpItem: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    lineHeight: 22,
  },
  celebrationCard: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: semanticColors.brand.primary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  changeDocButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeDocButtonText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: semanticColors.text.secondary,
  },
});
