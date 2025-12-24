import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export function GraduateBanner() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('features.signup.ui.graduate_banner_title')}
      </Text>
      <Text style={styles.subtitle}>
        {t('features.signup.ui.graduate_banner_subtitle')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F3FF',
    borderWidth: 1,
    borderColor: '#E2D5FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: semanticColors.brand.primary,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B5B7A',
    fontFamily: 'Pretendard-Regular',
  },
});
