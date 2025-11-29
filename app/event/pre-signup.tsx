import { View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import Event from '@features/event';
import { platform } from '@shared/libs/platform';
import { useEffect, useRef } from 'react';
import { PalePurpleGradient } from '@shared/ui';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreSignup } from '@/src/features/pre-signup';

const { hooks: { useEventAnalytics } } = Event;

export default function PreSignupScreen() {
  useEffect(() => {
    window.location.href = 'https://info.some-in-univ.com/';
  }, []);
  const { trackEventAction } = useEventAnalytics('pre-signup');

  const cardSectionOpacity = useSharedValue(0);
  const cardSectionTranslateY = useSharedValue(50);
  const characterOpacity = useSharedValue(1);

  // 여우 캐릭터 앞에 위치해야 해서 z 인덱스 1 설정
  const cardSectionStyle = useAnimatedStyle(() => ({
    opacity: cardSectionOpacity.value,
    transform: [{ translateY: cardSectionTranslateY.value }],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '100%',
  }));

  const characterStyle = useAnimatedStyle(() => ({
    opacity: characterOpacity.value,
  }));

  // 초기 애니메이션 설정
  useEffect(() => {
    setTimeout(() => {
      cardSectionOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      cardSectionTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 1000);
  }, []);

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, height: "100%" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <PalePurpleGradient />
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={true}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
        >
          <View
            style={styles.container}
          >
            <View style={styles.contentContainer}>
              <PreSignup.Header />
              <View style={styles.characterContainer}>
                <PreSignup.CharacterImage style={characterStyle} />
                <PreSignup.CardCarousel
                  style={cardSectionStyle}
                  trackEventAction={trackEventAction}
                />
              </View>
            </View>
            <PreSignup.Footer trackEventAction={trackEventAction} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    minHeight: '100%',
    paddingTop: Platform.select({
      ios: 50,
      android: 50,
      web: 40,
    }) || 50,
    justifyContent: 'space-between'
  },
  contentContainer: {
    flex: 1,
  },
  characterContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'visible',
  },
});