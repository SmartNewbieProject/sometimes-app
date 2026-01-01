import BigTitle from "@/assets/icons/big-title.svg";
import { AppleReviewModal } from "@/src/features/auth/ui/apple-review-modal";
import { EmailLoginModal } from "@/src/features/auth/ui/email-login-modal";
import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function Logo() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [isEmailLoginModalVisible, setIsEmailLoginModalVisible] =
    useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const rotationValue = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

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
    Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 167,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[logoStyles.container, { paddingTop: insets.top }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={logoStyles.logoWrapper}
      >
        <Image
          style={logoStyles.letterIcon}
          source={require("@assets/images/letter.png")}
          accessibilityLabel={t("ui.썸타임_편지_아이콘")}
          alt={t("ui.썸타임_편지_아이콘")}
        />
        <Animated.View
          style={{ transform: [{ rotate: spin }] }}
          accessibilityLabel={t("ui.썸타임_로고")}
          accessibilityRole="image"
        >
          <BigTitle width={309} height={41} aria-label={t("ui.썸타임")} role="img" />
        </Animated.View>
      </Pressable>
      <View style={logoStyles.taglineWrapper}>
        <Pressable
          onLongPress={() => setIsEmailLoginModalVisible(true)}
          delayLongPress={2000}
        >
          <Text size="20" weight="medium" textColor="purple">
            {t("features.signup.ui.logo.tagline")}
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

const logoStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  logoWrapper: {
    position: 'relative',
    marginTop: 40,
  },
  letterIcon: {
    position: "absolute",
    right: 50,
    top: -50,
    width: 48,
    height: 48,
  },
  taglineWrapper: {
    marginTop: 12,
  },
});
