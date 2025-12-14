import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <Image
            source={require('@assets/images/sad-miho.png')}
            style={styles.mihoImage}
            contentFit="contain"
          />
          <Text size="xl" weight="bold" style={styles.title}>
            {t('global.not_found.title')}
          </Text>
          <Text size="sm" textColor="gray" style={styles.description}>
            {t('global.not_found.description')}
          </Text>
        </View>

        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text size="md" weight="semibold" textColor="white">
              {t('global.not_found.go_home')}
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mihoImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
});
