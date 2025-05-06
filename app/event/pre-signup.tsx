import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Signup from '@features/signup';
import Event from '@features/event';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
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
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40
          }}
          scrollEnabled={true}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
        >
          <View
            className={cn(
              "flex-col px-4 min-h-full",
              platform({
                ios: () => "pt-[50px]",
                android: () => "pt-[50px]",
                web: () => "pt-[40px]",
              })
            )}
            style={{ justifyContent: 'space-between' }}
          >
            <View className="flex-1">
              <PreSignup.Header />
              <View className="justify-start items-center overflow-visible">
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