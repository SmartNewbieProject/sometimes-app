import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Button, ImageSelector } from '@/src/shared/ui';
import { router } from 'expo-router';
import Signup from '@/src/features/signup';
import { Form } from '@/src/widgets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { z } from 'zod';
import { useEffect, useState } from 'react';

const { SignupSteps, useChangePhase, useSignupProgress, useSignupAnalytics } = Signup;

type FormState = {
  images: (string | null)[];
}

type ImageState = (string | null)[];

const schema = z.object({
  images: z.array(z.string().nullable())
    .min(3, { message: '3장의 사진을 올려주세요' })
    .refine((images) => images.every((img) => img !== null), {
      message: '3장의 사진을 올려주세요'
    }),
});

export default function ProfilePage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const [images, setImages] = useState<(string | null)[]>(userForm.profileImages ?? [null, null, null]);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics('profile_image');

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      images: userForm.profileImages ?? [null, null, null],
    },
  });

  const formImages = form.watch('images');
  console.log({ formImages });

  const onNext = () => {
    trackSignupEvent('next_button_click', 'to_university');
    updateForm({
      ...userForm,
      profileImages: images as string[],
    });
    router.push('/auth/signup/university');
  };

  const nextable = images.every((image) => image !== null);

  const nextButtonMessage = (() => {
    if (!nextable) return '조금만 더 알려주세요';
    return '다음으로';
  })();

  const uploadImage = (index: number, value: string) =>
    setImages([...images.slice(0, index), value, ...images.slice(index + 1)]);

  useChangePhase(SignupSteps.PROFILE_IMAGE);

  useEffect(() => {
    form.setValue('images', images);
  }, [images]);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5">
        <Image
          source={require('@assets/images/profile-image.png')}
          style={{ width: 81, height: 81 }}
        />
        <Text weight="semibold" size="20" textColor="black" className="mt-2">
          프로필 사진 없으면 매칭이 안 돼요!
        </Text>
        <Text weight="semibold" size="20" textColor="black">
          지금 바로 추가해 주세요
        </Text>
      </View>

      <View className="flex flex-col py-4 px-5">
        <Text weight="medium" size="sm" textColor="pale-purple">
          매칭을 위해 3장의 프로필 사진을 모두 올려주세요
        </Text>
        <Text weight="medium" size="sm" textColor="pale-purple">
          얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
        </Text>
      </View>

      <View className="flex-1 flex flex-col gap-y-4">
        <View className="flex w-full justify-center items-center">
          <ImageSelector
            size="sm"
            value={images[0] ?? undefined}
            onChange={(value) => {
              trackSignupEvent('image_upload', 'image_1');
              uploadImage(0, value);
              form.trigger('images');
            }}
          />
        </View>

        <View className="flex flex-row justify-center gap-x-4">
          <ImageSelector
            size="sm"
            value={images[1] ?? undefined}
            onChange={(value) => {
              trackSignupEvent('image_upload', 'image_2');
              uploadImage(1, value);
              form.trigger('images');
            }}
          />
          <ImageSelector
            size="sm"
            value={images[2] ?? undefined}
            onChange={(value) => {
              trackSignupEvent('image_upload', 'image_3');
              uploadImage(2, value);
              form.trigger('images');
            }}
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
        <Button variant="secondary" onPress={() => {
          trackSignupEvent('back_button_click', 'to_profile');
          router.push('/auth/signup/profile');
        }} className="flex-[0.3]">
          뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
          {nextButtonMessage}
        </Button>
      </View>
    </View>
  );
}
