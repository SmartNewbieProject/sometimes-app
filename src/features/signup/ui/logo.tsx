import BigTitle from "@/assets/icons/big-title.svg";
import { AppleReviewModal } from "@/src/features/auth/ui/apple-review-modal";
import { EmailLoginModal } from "@/src/features/auth/ui/email-login-modal";
import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
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
    <View
      className={cn("flex flex-col items-center gap-y-2")}
      style={{ paddingTop: insets.top }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="relative mt-[80px]"
      >
        <Image
          style={{
            position: "absolute",
            right: 45,
            top: -71,
            width: 60,
            height: 60,
          }}
          source={require("@assets/images/letter.png")}
        />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <BigTitle width={309} height={41} />
        </Animated.View>
      </Pressable>
      <View className="mt-[20px]">
        <Pressable
          onLongPress={() => setIsEmailLoginModalVisible(true)}
          delayLongPress={2000}
        >
          <Text className="text-[20px] font-medium text-primaryPurple">
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
