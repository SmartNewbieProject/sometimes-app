import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import i18n from '@/src/shared/libs/i18n';
import { useOnboardingStorage } from '@/src/features/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DevToolsPage() {
  const insets = useSafeAreaInsets();
  const { checkOnboardingStatus } = useOnboardingStorage();

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@sometime:user:state');
      alert('온보딩 상태가 초기화되었습니다.\n앱을 재시작하면 온보딩이 다시 표시됩니다.');
    } catch (error) {
      alert('초기화 실패: ' + error);
    }
  };

  const handleCheckStatus = async () => {
    const hasSeen = await checkOnboardingStatus();
    alert(`온보딩 완료 여부: ${hasSeen ? '완료' : '미완료'}`);
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>🛠️ 개발 도구</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>온보딩</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.buttonText}>온보딩 열기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleCheckStatus}
          >
            <Text style={styles.buttonTextSecondary}>온보딩 상태 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.buttonText}>온보딩 초기화</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>언어 전환</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              i18n.changeLanguage('ko');
              alert('한국어로 변경되었습니다');
            }}
          >
            <Text style={styles.buttonText}>🇰🇷 한국어</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              i18n.changeLanguage('ja');
              alert('日本語に変更されました');
            }}
          >
            <Text style={styles.buttonText}>🇯🇵 일본어</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              i18n.changeLanguage('en');
              alert('Changed to English');
            }}
          >
            <Text style={styles.buttonText}>🇬🇧 영어</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>네비게이션</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.buttonText}>홈으로 이동</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonTextSecondary}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>현재 언어: {i18n.language}</Text>
          <Text style={styles.infoText}>경로: /dev-tools</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primaryPurple,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primaryPurple,
  },
  buttonDanger: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: colors.primaryPurple,
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: colors.cardPurple,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
});
