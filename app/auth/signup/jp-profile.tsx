/**
 * JP 프로필 입력 화면
 *
 * SMS 인증에서는 이름/생년월일/성별을 받지 않으므로
 * 대학 선택 전에 별도로 입력받음
 */

import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, Button, Input } from '@/src/shared/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSignupProgress from '@/src/features/signup/hooks/use-signup-progress';
import { isAdult } from '@/src/features/pass/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

type Gender = 'MALE' | 'FEMALE';

export default function JpProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateForm } = useSignupProgress();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidName = name.trim().length >= 1;
  const isValidBirthday = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
  const isValid = isValidName && isValidBirthday && gender !== null;

  const formatBirthdayInput = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);

    if (cleaned.length <= 4) {
      return cleaned;
    }
    if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
  }, []);

  const calculateAge = useCallback((birthdayStr: string): number => {
    const today = new Date();
    const birth = new Date(birthdayStr);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }, []);

  const handleNext = async () => {
    if (!isValid) return;

    setError(null);

    if (!isAdult(birthday)) {
      mixpanelAdapter.track('Signup_AgeCheck_Failed', {
        birthday,
        platform: 'jp_sms',
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
      router.push('/auth/age-restriction');
      return;
    }

    try {
      const certInfoStr = await AsyncStorage.getItem('signup_certification_info');
      const certInfo = certInfoStr ? JSON.parse(certInfoStr) : {};

      const age = calculateAge(birthday);

      updateForm({
        name,
        birthday,
        gender,
        age,
        phoneNumber: certInfo.phone,
        loginType: certInfo.loginType || 'jp_sms',
      });

      await AsyncStorage.setItem(
        'signup_certification_info',
        JSON.stringify({
          ...certInfo,
          name,
          birthday,
          gender,
        })
      );

      mixpanelAdapter.track('Signup_JpProfile_Completed', {
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      router.push('/auth/signup/university');
    } catch (err) {
      setError(t('features.jp-auth.profile.error'));
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <DefaultLayout style={styles.layout}>
      <PalePurpleGradient />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text size="16">← {t('features.jp-auth.profile.back')}</Text>
          </TouchableOpacity>
          <Text size="20" weight="bold" style={styles.headerTitle}>
            {t('features.jp-auth.profile.title')}
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text size="14" weight="semibold" style={styles.label}>
                {t('features.jp-auth.profile.name')}
              </Text>
              <Input
                size="lg"
                value={name}
                onChangeText={setName}
                placeholder={t('features.jp-auth.profile.name_placeholder')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text size="14" weight="semibold" style={styles.label}>
                {t('features.jp-auth.profile.birthday')}
              </Text>
              <Input
                size="lg"
                value={birthday}
                onChangeText={(text) => setBirthday(formatBirthdayInput(text))}
                placeholder={t('features.jp-auth.profile.birthday_placeholder')}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text size="12" style={styles.hint}>
                {t('features.jp-auth.profile.birthday_hint')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text size="14" weight="semibold" style={styles.label}>
                {t('features.jp-auth.profile.gender')}
              </Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'MALE' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('MALE')}
                >
                  <Text
                    size="16"
                    weight={gender === 'MALE' ? 'bold' : 'regular'}
                    style={gender === 'MALE' ? styles.genderTextActive : styles.genderText}
                  >
                    {t('features.jp-auth.profile.male')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'FEMALE' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('FEMALE')}
                >
                  <Text
                    size="16"
                    weight={gender === 'FEMALE' ? 'bold' : 'regular'}
                    style={gender === 'FEMALE' ? styles.genderTextActive : styles.genderText}
                  >
                    {t('features.jp-auth.profile.female')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && <Text size="14" style={styles.error}>{error}</Text>}
          </View>
        </ScrollView>

        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            variant="primary"
            size="lg"
            rounded="full"
            width="full"
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text textColor="white" size="18" weight="semibold">
              {t('features.jp-auth.profile.next')}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  layout: {
    position: 'relative',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface.background,
  },
  backButton: {
    width: 60,
  },
  headerTitle: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: semanticColors.text.secondary,
  },
  hint: {
    color: semanticColors.text.tertiary,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  genderButtonActive: {
    borderColor: semanticColors.brand.primary,
    backgroundColor: semanticColors.brand.primary,
  },
  genderText: {
    color: semanticColors.text.secondary,
  },
  genderTextActive: {
    color: colors.white,
  },
  error: {
    color: '#DC2626',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.surface.background,
  },
});
