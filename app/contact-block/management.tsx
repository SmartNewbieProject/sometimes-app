import { BlockedContactListScreen } from '@/src/features/contact-block/ui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Header, Text } from '@/src/shared/ui';
import Layout from '@/src/features/layout';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

export default function ContactManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Layout.Default style={styles.container}>
      <Header.Container style={styles.headerContainer}>
        <Header.LeftContent>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.arrowContainer}
          >
            <View style={styles.backArrow} />
          </TouchableOpacity>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="bold" textColor="black">
            차단된 연락처 관리
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <View style={{ width: 24 }} />
        </Header.RightContent>
      </Header.Container>

      <BlockedContactListScreen />
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  headerContainer: {
    alignItems: 'center',
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: 'absolute',
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    borderTopWidth: 2,
    borderTopColor: '#000',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});
