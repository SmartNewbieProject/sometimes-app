import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import SignupButtons from "./buttons";
import { Form } from "@/src/widgets";
import { useForm } from "react-hook-form";
import { tryCatch } from "@/src/shared/libs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../auth";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { platform } from "@shared/libs/platform";

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
  const { login, loginWithPass, isAuthorized } = useAuth();
  const [isPassMode, setIsPassMode] = useState(false);
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
    if (platform({ web: () => true, default: () => false })) {
      // PortOne V2 SDK 사용
      try {
        const PortOne = await import("@portone/browser-sdk/v2");

        const response = await PortOne.requestIdentityVerification({
          storeId: process.env.EXPO_PUBLIC_STORE_ID as string,
          channelKey: process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string,
          identityVerificationId: `cert_${new Date().getTime()}`,
          windowType: {
            pc: "POPUP",
            mobile: "POPUP"
          }
        });

        if (!response) {
          console.error('본인인증 응답이 없습니다.');
          return;
        }

        if (response.code != null) {
          // 본인인증 실패
          console.error('본인인증 실패:', response.message);
          return;
        }

        // 본인인증 성공 - imp_uid 대신 identityVerificationId 사용
        tryCatch(async () => {
          const result = await loginWithPass(response.identityVerificationId);
          if (!result.isNewUser) {
            router.navigate('/home');
          }
        }, (error) => {
          console.error('PASS 로그인 실패:', error);
        });

      } catch (error) {
        console.error('PortOne V2 SDK 로드 실패:', error);
      }
    } else {
      // 모바일에서는 추후 구현
      console.log('모바일 PASS 인증은 추후 구현 예정');
    }
  };

  useFocusEffect(useCallback(
    () => {
      if (isAuthorized) router.push('/home');
    }, [isAuthorized]
  ));

  return (
    <View className="flex flex-col flex-1 h-full">
      {!isPassMode ? (
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
      ) : (
        <View className="flex flex-col gap-y-[20px] mt-8">
          <View className="bg-purple-50 p-4 rounded-lg">
            <Text className="text-purple-700 text-center font-medium">
              PASS 인증으로 간편하게 로그인하세요
            </Text>
            <Text className="text-purple-600 text-center text-sm mt-2">
              본인인증을 통해 안전하고 빠르게 로그인할 수 있습니다
            </Text>
          </View>
        </View>
      )}

      <View className="mt-auto">
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity onPress={() => setIsPassMode(!isPassMode)}>
            <Text className="text-purple-600 text-sm underline">
              {isPassMode ? '이메일로 로그인' : 'PASS 인증으로 로그인'}
            </Text>
          </TouchableOpacity>
        </View>

        <SignupButtons
          onPress={isPassMode ? undefined : onPressLogin}
          onPassLogin={isPassMode ? onPressPassLogin : undefined}
        />
      </View>
    </View>
  );
}
