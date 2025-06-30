import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Divider, Text, Button } from "@/src/shared/ui";
import SignupButtons from "./buttons";
import { Form } from "@/src/widgets";
import { useForm } from "react-hook-form";
import { tryCatch } from "@/src/shared/libs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePortOneLogin } from "@/src/features/pass";
import { useAuth } from "../../auth";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

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
  const [isPassMode, setIsPassMode] = useState(false);

  const { startPortOneLogin, isLoading, error, clearError } = usePortOneLogin({
    onSuccess: (isNewUser) => console.log(isNewUser ? 'New user flow' : 'Existing user'),
    onError: (error) => console.error('Login failed', error),
  });

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
      router.navigate('/home');
    }, (error) => {
      if (error.status === 401) {
        form.setError('password', { message: '아이디가 존재하지 않거나 비밀번호가 일치하지 않습니다' });
      }
    });
  });

const onPressPassLogin = async () => {
    clearError(); // 이전 에러 메시지 제거
    await startPortOneLogin();
  };

  useFocusEffect(useCallback(
    () => {
      if (isAuthorized) router.push('/home');
    }, [isAuthorized]
  ));

  // 토큰 저장 후 즉시 홈으로 이동하도록 감지
  useEffect(() => {
    if (isAuthorized) {
      console.log('인증 상태 변화 감지, 홈으로 이동');
      router.replace('/home');
    }
  }, [isAuthorized]);

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

          <View className="flex flex-col">
            <View className="w-full flex justify-center text-center">
              <Text textColor="gray" style={styles.orText}>또는</Text>
              <View className="w-full flex flex-row justify-center my-6">
                <Button 
                  variant="primary" 
                  width="full" 
                  onPress={onPressPassLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'PASS 인증 중...' : 'PASS 로 바로 시작하기'}
                </Button>
              </View>
              
              {error && (
                <TouchableOpacity 
                  className="w-full px-4 py-2 bg-red-50 rounded-md"
                  onPress={clearError}
                >
                  <Text className="text-red-600 text-sm text-center">{error}</Text>
                  <Text className="text-red-400 text-xs text-center mt-1">탭하여 닫기</Text>
                </TouchableOpacity>
              )}

            </View>
          </View>

          <View className="flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-600 text-sm">아이디 찾기</Text>
            <Text className="text-gray-300 text-sm">|</Text>
            <Text className="text-gray-600 text-sm">비밀번호 찾기</Text>
          </View>
        </View>

      <View className="mt-auto">
        <SignupButtons
          onPress={isPassMode ? undefined : onPressLogin}
          onPassLogin={isPassMode ? onPressPassLogin : undefined}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  orText: {
    textAlign: 'center',
  },
});
