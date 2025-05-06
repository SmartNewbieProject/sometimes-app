import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import SignupButtons from "./buttons";
import { Form } from "@/src/widgets";
import { useForm } from "react-hook-form";
import { environmentStrategy, tryCatch } from "@/src/shared/libs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../auth";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Admin } from "../../admin";

type Form = {
  email: string;
  password: string;
}

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$/;
// const passwordRegex = /.*/;

const loginSchema = z.object({
  email: z.string({ required_error: "이메일을 입력해주세요" }).email({ message: "이메일을 입력해주세요" }),
  password: z.string({ required_error: '비밀번호를 입력해주세요.' }).regex(passwordRegex, { message: '올바른 비밀번호를 입력해주세요' }),
});

export default function LoginForm() {
  const { login, isAuthorized } = useAuth();
  const form = useForm<Form>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onPressLogin = form.handleSubmit(async ({ email, password }) => {
    tryCatch(async () => {
      await login(email, password);
      environmentStrategy({
        production: () => {
          Admin.services.loginProduction(email);
        },
        development: () => {
          router.navigate('/home');
        },
      });
    }, (error) => {
      if (error.status === 401) {
        form.setError('password', { message: '아이디가 존재하지 않거나 비밀번호가 일치하지 않습니다' });
      }
    });
  });

  useFocusEffect(useCallback(
    () => {
      if (isAuthorized) router.push('/');
    }, [isAuthorized]
  ));

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

      <SignupButtons onPress={onPressLogin} />
    </View>
  );
}
