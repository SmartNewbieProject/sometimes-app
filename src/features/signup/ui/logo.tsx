import {IconWrapper} from "@/src/shared/ui/icons";
import {View, Animated, Pressable} from "react-native";
import SmallTitle from '@/assets/icons/small-title.svg';
import {Text} from "@/src/shared/ui";
import {cn} from "@/src/shared/libs/cn";
import {platform} from "@/src/shared/libs/platform";
import {Image} from "expo-image";
import {useRef, useState} from "react";
import {AppleReviewModal} from "@/src/features/auth/ui/apple-review-modal";
import {EmailLoginModal} from "@/src/features/auth/ui/email-login-modal";

export default function Logo() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEmailLoginModalVisible, setIsEmailLoginModalVisible] = useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
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
    outputRange: ['0deg', '360deg'],
  });

  return (
      <View className={cn(
          "flex flex-col items-center gap-y-2",
          platform({
            ios: () => "pt-[80px]",
            android: () => "pt-[5px]",
            web: () => "",
          })
      )}>
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="p-0 md:p-18 mb-8"
        >
          <Animated.View style={{transform: [{rotate: spin}]}}>
            <Image
                source={require('@assets/images/paper-plane.png')}
                style={{width: 128, height: 128}}
            />
          </Animated.View>
        </Pressable>
        <IconWrapper width={400} className="text-primaryPurple">
          <SmallTitle/>
        </IconWrapper>
        <View className="items-center pt-[8px] flex flex-col gap-y-[6px]">
          <Pressable
              onLongPress={() => setIsEmailLoginModalVisible(true)}
              delayLongPress={2000}
          >
            <Text className="text-[15px] text-primaryPurple">익숙한 하루에 설렘 하나</Text>
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
