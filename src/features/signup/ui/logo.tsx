import BigTitle from "@/assets/icons/big-title.svg";
import { AppleReviewModal } from "@/src/features/auth/ui/apple-review-modal";
import { EmailLoginModal } from "@/src/features/auth/ui/email-login-modal";
import { platform } from "@/src/shared/libs/platform";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Animated, Pressable, View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Logo() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [isEmailLoginModalVisible, setIsEmailLoginModalVisible] =
    useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const rotationValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    const timeout = setTimeout(() => {
      startRotation();
      setTimeout(() => {
        setIsModalVisible(true);
      }, 2500);
    }, 2500);
    setLongPressTimeout(timeout);
  };

  const handlePressOut = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  const startRotation = () => {
    const spin = () => {
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        rotationValue.setValue(0);
        spin();
      });
    };
    spin();
  };

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.logoContainer}
      >
        <Image
          style={styles.letterImage}
          source={require("@assets/images/letter.png")}
        />
        <Animated.View style={[styles.animatedLogo, { transform: [{ rotate: spin }] }]}>
          <BigTitle width={309} height={41} />
        </Animated.View>
      </Pressable>
      <View style={styles.taglineContainer}>
        <Pressable
          onLongPress={() => setIsEmailLoginModalVisible(true)}
          delayLongPress={2000}
        >
          <Text style={styles.tagline}>
            대학생을 위한 진짜 설렘의 시작
          </Text>
        </Pressable>
      </View>

      <AppleReviewModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <EmailLoginModal
        isVisible={isEmailLoginModalVisible}
        onClose={() => setIsEmailLoginModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8, // gap-y-2
  },
  logoContainer: {
    position: 'relative',
    marginTop: Platform.OS === 'web' ? 60 : 80, // 웹에서는 마진을 줄임
  },
  letterImage: {
    position: 'absolute',
    right: Platform.OS === 'web' ? 35 : 45, // 웹에서는 위치 조정
    top: Platform.OS === 'web' ? -55 : -71, // 웹에서는 위치 조정
    width: Platform.OS === 'web' ? 45 : 60, // 웹에서는 크기 조정
    height: Platform.OS === 'web' ? 45 : 60, // 웹에서는 크기 조정
  },
  animatedLogo: {
    // 웹에서 로고 크기 조정
    ...(Platform.OS === 'web' && {
      transform: [{ scale: 0.85 }], // 웹에서는 85% 크기로 조정
    }),
  },
  taglineContainer: {
    marginTop: Platform.OS === 'web' ? 15 : 20, // 웹에서는 마진 조정
  },
  tagline: {
    fontSize: Platform.OS === 'web' ? 18 : 20, // 웹에서는 폰트 크기 조정
    fontWeight: '500',
    color: '#A78BFA', // text-primaryPurple
    textAlign: 'center',
  },
});
