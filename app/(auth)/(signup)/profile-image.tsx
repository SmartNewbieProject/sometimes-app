import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Button, ImageSelector, Label } from '@/src/shared/ui';
import { router } from 'expo-router';
import Signup from '@/src/features/signup';
import { Form } from '@/src/widgets';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
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

export default function ProfilePage() {
  const { updateForm, form: userForm } = useSignupProgress();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const { handleSubmit, formState: { isValid, errors } } = form;
  const mbti = form.watch('mbti');
  const gender = form.watch('gender');

  console.log({ gender });

  const onNext = handleSubmit((data) => {
    updateForm({
      ...userForm,
      name: data.name,
      birthday: data.birthday,
      gender: data.gender,
      mbti: data.mbti,
    });
  });

  const nextable = (() => {
    return isValid;
  })();

  const nextButtonMessage = (() => {
    if (!isValid) return '조금만 더 알려주세요';
    if (!mbti) return 'MBTI를 선택해주세요';
    return '다음으로';
  })();

  useChangePhase(SignupSteps.PROFILE_IMAGE);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5">
        <Image  
          source={require('@assets/images/personal.png')}
          style={platform({
            web: () => ({ width: 96, height: 96 }),
            ios: () => ({ width: 128, height: 128 }),
            android: () => ({ width: 128, height: 128 }),
            default: () => ({ width: 128, height: 128 }),
          })}
        />
          <Text weight="semibold" size="20" textColor="black">
          프로필 사진 없으면 매칭이 안 돼요!
          </Text>
          <Text weight="semibold" size="20" textColor="black">
          지금 바로 추가해 주세요
          </Text>
      </View>

      <View className="flex-1 flex flex-col">
        <ImageSelector
          onChange={(value) => {
          }}
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
        <Button variant="secondary" onPress={() => router.back()} className="flex-[0.3]">
            뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
          {nextButtonMessage}
        </Button>
      </View>
    </View>
  );
}
