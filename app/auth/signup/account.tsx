import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Button } from '@/src/shared/ui';
import { router } from 'expo-router';
import Signup from '@/src/features/signup';
import { Form } from '@/src/widgets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import Layout from '@/src/features/layout';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

const { SignupSteps, useChangePhase, schemas, useSignupProgress } = Signup;

type FormState = {
  email: string;
  password: string;
  passwordConfirm: string;
}

export default function AccountScreen() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { updateForm, form: { email, password } } = useSignupProgress();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const form = useForm<FormState>({
    resolver: zodResolver(schemas.account),
    mode: 'onBlur',
    defaultValues: {
      email,
      password,
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const isPasswordMatch = form.watch('password') === form.watch('passwordConfirm');

  const onNext = handleSubmit((data) => {
    updateForm({
      email: data.email,
      password: data.password,
    });
    router.push('/auth/signup/phone');
  });

  const nextable = isValid;

  const nextButtonMessage = (() => {
    if (!isValid) return '조금만 더 알려주세요';
    if (!isPasswordMatch) return '비밀번호가 동일하지 않아요';
    return '다음으로';
  })();

  useChangePhase(SignupSteps.ACCOUNT);

  return (
    <Layout.Default>
      <View className="flex-1 flex flex-col">
        <PalePurpleGradient />
        <View className="px-5">
          <Image
            source={require('@assets/images/personal.png')}
            style={{ width: 81, height: 81 }}
          />
          <Text weight="semibold" size="20" textColor="black">
            동의해 주셔서 감사합니다 :)
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            이제 몇 가지만 더 알려주세요
          </Text>
        </View>

        <View className={cn(
          platform({
            web: () => "px-8 flex flex-col gap-y-[8px] flex-1 mt-[14px]",
            ios: () => "px-8 flex flex-col gap-y-[40px] flex-1 mt-[30px]",
            android: () => "px-8 flex flex-col gap-y-[40px] flex-1 mt-[30px]",
            default: () => ""
          })
        )}>
          <Form.LabelInput
            name="email"
            control={form.control}
            label="이메일"
            size="sm"
            placeholder="이메일 주소"
          />
          <Form.LabelInput
            name="password"
            size="sm"
            control={form.control}
            label="비밀번호"
            placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
            isPassword
          />
          <Form.LabelInput
            name="passwordConfirm"
            size="sm"
            control={form.control}
            label="비밀번호 확인"
            placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
            isPassword
          />
        </View>

        {!isKeyboardVisible && (
          <View className={cn(
            platform({
              web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
              android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
              ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
              default: () => ""
            })
          )}>
            <Button variant="secondary" onPress={() => router.push('/auth/signup/terms')} className="flex-[0.3]">
              뒤로
            </Button>
            <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable && !isPasswordMatch}>
              {nextButtonMessage}
            </Button>
          </View>
        )}
      </View>
    </Layout.Default>
  );
}
