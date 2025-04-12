import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Button, Label } from '@/src/shared/ui';
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

  useChangePhase(SignupSteps.PERSONAL_INFO);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5">
        <Image  
          source={require('@assets/images/details.png')}
          style={platform({
            web: () => ({ width: 96, height: 96 }),
            ios: () => ({ width: 128, height: 128 }),
            android: () => ({ width: 128, height: 128 }),
            default: () => ({ width: 128, height: 128 }),
          })}
        />
          <Text weight="semibold" size="20" textColor="black">
          이제 거의 다 왔어요!
          </Text>
          <Text weight="semibold" size="20" textColor="black">
          간단한 정보만 입력해볼까요?
          </Text>
      </View>

      <View className="px-5 flex flex-col gap-y-[14px] mt-[20px] flex-1">
        <Form.LabelInput 
          name="name"
          control={form.control}
          label="이름"
          size="sm"
          placeholder="이름"
        />

        <View className="flex flex-row gap-x-2 items-center">
          <Form.LabelInput
            name="birthday"
            control={form.control}
            label="생년월일"
            size="sm"
            placeholder="생년월일6자리"
            className="w-[146px]"
          />
          <View className="flex flex-col gap-y-1">
            <Label label="성별" size="sm" />
            <Selector
              value={gender}
              options={[
                { label: '남성', value: 'male' },
                { label: '여성', value: 'female' },
              ]}
              onChange={(value) => {
                form.setValue('gender', value as Gender);
              }}
              className="w-fit"
              buttonProps={{
                className: 'w-fit h-[38px]',
              }}
            />
          </View>
        </View>

        <View className="flex flex-col gap-y-1.5">
          <Label label="MBTI" size="sm" />
          <Controller 
            control={form.control}
            name="mbti"
            render={({ field }) => (
              <MbtiSelector onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />
        </View>

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
