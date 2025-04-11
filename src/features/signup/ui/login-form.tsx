import { Input } from "@/src/shared/ui/input";
import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import SignupButtons from "./buttons";

export default function LoginForm() {
  return (
    <View>
      <View className="flex flex-col gap-y-[40px] mt-8">
      <View className="flex flex-col gap-y-2">
        <Text className="text-[18px] font-semibold text-primaryPurple">이메일</Text>
        <Input
          placeholder="이메일 주소"
        />
      </View>

        <View>
        <Text className="text-[18px] font-semibold text-primaryPurple">비밀번호</Text>
        <Input
          placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
        />
      </View>

      <View className="flex-row justify-center items-center gap-x-2">
        <Text className="text-gray-600">아이디 찾기</Text>
        <Text className="text-gray-300">|</Text>
        <Text className="text-gray-600">비밀번호 찾기</Text>
      </View>
      </View>
      <SignupButtons />
    </View>
  );
}
