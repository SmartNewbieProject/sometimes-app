import { Input } from "@/src/shared/ui/input";
import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import SignupButtons from "./buttons";
import { Form } from "@/src/widgets";
import { useForm } from "react-hook-form";

type Form = {
  email: string;
  password: string;
}

export default function LoginForm() {
  const form = useForm<Form>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <View className="flex flex-col flex-1 h-full">
      <View className="flex flex-col gap-y-[20px] mt-8">
          <Form.LabelInput
            name="email"
            control={form.control}
            label="이메일"
            size="sm"
            placeholder="이메일 주소"
          />
          <Form.LabelInput
            name="password"
            control={form.control}
            label="비밀번호"
            size="sm"
            placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
            isPassword
          />

        <View className="flex-row justify-center items-center gap-x-2">
          <Text className="text-gray-600 text-sm">아이디 찾기</Text>
          <Text className="text-gray-300 text-sm">|</Text>
          <Text className="text-gray-600 text-sm">비밀번호 찾기</Text>
        </View>
      </View>
      <SignupButtons />
    </View>
  );
}
