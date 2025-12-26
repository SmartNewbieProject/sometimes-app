import { Slot, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, Text } from '@/src/shared/ui';
import Layout from '@/src/features/layout';

export default function ContactBlockLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Layout.Default style={styles.container}>
      <Header.Container style={styles.headerContainer}>
        <Header.LeftContent>
          <Pressable
            onPress={() => router.back()}
            style={styles.arrowContainer}
          >
            <View style={styles.backArrow} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="bold" textColor="black">
            안심하고 시작하기
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <View style={{ width: 24 }} />
        </Header.RightContent>
      </Header.Container>

      <Slot />
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
