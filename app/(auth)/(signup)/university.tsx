import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Button, Divider, Label } from '@/src/shared/ui';
import { router } from 'expo-router';
import Signup from '@/src/features/signup';
import { Form } from '@/src/widgets';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { Selector } from '@/src/widgets/selector';
import { MbtiSelector } from '@/src/widgets/mbti-selector';
import { z } from 'zod';

const { SignupSteps, useChangePhase, schemas, useSignupProgress } = Signup;

type Gender = 'male' | 'female';

type Form = {
  name: string;
  birthday: string;
  gender: Gender;
  mbti: string;
}

const schema = z.object({
  name: z.string({ required_error: '이름을 입력해주세요' }).min(1, { message: '이름을 입력해주세요' }),
  birthday: z.string({ required_error: '생년월일을 입력해주세요' }).min(6, { message: '생년월일 6자리' }),
  gender: z.enum(['male', 'female'] as const, { required_error: '성별을 선택해주세요' }),
  mbti: z.string({ required_error: 'MBTI를 선택해주세요' }).min(4, { message: 'MBTI를 선택해주세요' }),
});

export default function UniversityPage() {
  const { updateForm, form: userForm } = useSignupProgress();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const { handleSubmit, formState: { isValid, errors }, trigger } = form;
  const mbti = form.watch('mbti');
  const gender = form.watch('gender');

  console.log({ errors, isValid });

  const onNext = handleSubmit((data) => {
    updateForm({
      ...userForm,
      name: data.name,
      birthday: data.birthday,
      gender: data.gender,
      mbti: data.mbti,
    });
    router.push('/(auth)/(signup)/profile-image');
  });

  const nextable = (() => {
    return isValid;
  })();

  const nextButtonMessage = (() => {
    if (!isValid) return '조금만 더 알려주세요';
    if (!mbti) return 'MBTI를 선택해주세요';
    return '다음으로';
  })();

  useChangePhase(SignupSteps.UNIVERSITY);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5">
        <Image  
          source={require('@assets/images/university.png')}
          style={{ width: 81, height: 81 }}
          className="mb-4"
        />
          <Text weight="semibold" size="20" textColor="black">
          다니고 있는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
          대학교 이름을 입력해 주세요
          </Text>

          <Divider.Horizontal className="my-4" />
      </View>

      <View className="px-5 flex flex-col gap-y-[14px] mt-[20px] flex-1">
        <Form.LabelInput 
          name="name"
          control={form.control}
          label="대학교"
          size="sm"
          placeholder="대학교를 입력하세요"
        />
      </View>

      <View className={cn(
        platform({
          web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
          android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          default: () => ""
        })
      )}>
        <Button variant="secondary" onPress={() => router.push('/(auth)/(signup)/profile-image')} className="flex-[0.3]">
            뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
          {nextButtonMessage}
        </Button>
      </View>
    </View>
  );
}
