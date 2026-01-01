import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JpIdentityContainer } from '@/src/features/jp-identity';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, Text } from '@/src/shared/ui';

export default function JpIdentityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Header.Container style={styles.headerContainer}>
        <Header.LeftContent>
          <Pressable
            onPress={() => router.navigate('/my')}
            style={styles.arrowContainer}
          >
            <View style={styles.backArrow} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="bold" textColor="black">
            本人確認
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <View style={{ width: 24 }} />
        </Header.RightContent>
      </Header.Container>

      <View style={styles.content}>
        <JpIdentityContainer />
      </View>
    </View>
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
  content: {
    flex: 1,
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
