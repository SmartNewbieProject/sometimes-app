import { platform } from "@shared/libs/platform";
import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { View } from "react-native";

export default function SignupButtons() {
  return (
    <View className="mt-flex flex-col gap-y-2" style={{
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
      onPress={() => {}}
      className="w-full"
    >
      로그인
    </Button>
    <Button 
      size="md"
      variant="secondary" 
      onPress={() => router.push('/(auth)/(signup)')}
      className="w-full"
      textColor="purple"
    >
      회원가입
    </Button>
  </View>
  );
}
