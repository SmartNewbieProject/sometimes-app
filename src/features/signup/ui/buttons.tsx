import { platform } from "@shared/libs/platform";
import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { View } from "react-native";

interface SignupButtonsProps {
  onPress: () => void;
}

export default function SignupButtons({ onPress }: SignupButtonsProps) {
  return (
    <View className="mt-flex flex-col px-2 gap-y-2" style={{
      ...platform({
        ios: () => ({
          paddingTop: 58,
          paddingBottom: 58,
        }),
        android: () => ({
          paddingTop: 58,
          paddingBottom: 58,
        }),
        web: () => ({
          paddingTop: 14,
          paddingBottom: 0,
        }),
      })
    }}>
    <Button 
      size="md"
      variant="primary" 
      onPress={onPress || (() => {})}
      className="w-full"
    >
      로그인
    </Button>
    <Button 
      size="md"
      variant="secondary" 
      onPress={() => router.push('/auth/signup/terms')}
      className="w-full"
      textColor="purple"
    >
      회원가입
    </Button>
  </View>
  );
}
