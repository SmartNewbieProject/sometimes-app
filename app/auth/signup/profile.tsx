import Signup from '@/src/features/signup';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { Button, Label } from '@/src/shared/ui';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Text } from '@/src/shared/ui/text';
import { Form } from '@/src/widgets';
import { MbtiSelector } from '@/src/widgets/mbti-selector';
import { Selector } from '@/src/widgets/selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, View, Platform } from 'react-native';
import { useKeyboarding } from '@/src/shared/hooks';

const { SignupSteps, useChangePhase, schemas, useSignupProgress, useSignupAnalytics } = Signup;

type Gender = 'MALE' | 'FEMALE';

type FormState = {
  name: string;
  birthday: string;
  gender: Gender;
  mbti: string;
}

export default function ProfilePage() {
  const { isKeyboardVisible } = useKeyboarding();
  const { updateForm, form: userForm } = useSignupProgress();

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics('profile');

  const form = useForm<FormState>({
    resolver: zodResolver(schemas.profile),
    mode: 'onChange',
    defaultValues: {
      name: userForm.name,
      birthday: userForm.birthday,
      gender: userForm.gender,
      mbti: userForm.mbti,
    },
  });

  const { handleSubmit, formState: { isValid }, trigger } = form;
  const mbti = form.watch('mbti');
  const gender = form.watch('gender');

  const onNext = handleSubmit((data) => {
    trackSignupEvent('next_button_click', 'to_profile_image');
    updateForm({
      ...userForm,
      name: data.name,
      birthday: data.birthday,
      gender: data.gender,
      mbti: data.mbti,
    });
    router.push('/auth/signup/profile-image');
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
    <KeyboardAvoidingView
      className="flex-1 flex flex-col"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PalePurpleGradient />
      <View className="px-5">
        <Image
          source={require('@assets/images/details.png')}
          style={{ width: 81, height: 81 }}
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
            maxLength={6}
            inputMode="numeric"
            wrapperClassName="flex-[0.5]"
            onBlur={() => form.trigger('birthday')}
          />
          <View className="flex flex-col gap-y-1" style={{ flex: 0.5 }}>
            <Label label="성별" size="sm" />
            <Selector
              value={gender}
              options={[
                { label: '남성', value: 'MALE' },
                { label: '여성', value: 'FEMALE' },
              ]}
              onChange={(value) => {
                form.setValue('gender', value as Gender);
                form.trigger('gender');
              }}
              buttonProps={{
                width: 'full',
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
              <MbtiSelector
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  trigger('mbti');
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        </View>

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
          <Button variant="secondary" onPress={() => {
            trackSignupEvent('back_button_click', 'to_phone');
            router.push('/auth/signup/phone');
          }} className="flex-[0.3]">
            뒤로
          </Button>
          <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
            {nextButtonMessage}
          </Button>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
