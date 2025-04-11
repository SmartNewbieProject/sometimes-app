import { Button } from "@/src/shared/ui/button";
import { router } from "expo-router";
import { View } from "react-native";

export default function SignupButtons() {
  return (
    <View className="mt-auto flex flex-col gap-y-2 mb-[58px] pt-[58px]">
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
      onPress={() => router.push('/(auth)/signup')}
      className="w-full"
      textColor="purple"
    >
      회원가입
    </Button>
  </View>
  );
}
