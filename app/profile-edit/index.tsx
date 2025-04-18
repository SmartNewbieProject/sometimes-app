import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button } from '@/src/shared/ui';
import { Form } from '@/src/widgets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Selector } from '@/src/widgets/selector';
import { useState } from 'react';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg';

type FormState = {
  name: string;
  birthday: string;
  gender: 'male' | 'female';
  university: string;
  mbti: string;
  instagramId: string;
};

const schema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }),
  birthday: z.string()
    .min(6, { message: '생년월일 6자리' })
    .max(6, { message: '생년월일 6자리' })
    .regex(/^\d+$/, { message: '숫자만 입력해주세요' }),
  gender: z.enum(['male', 'female']),
  university: z.string().min(1, { message: '대학교를 입력해주세요' }),
  mbti: z.string().min(4, { message: 'MBTI를 입력해주세요' }),
  instagramId: z.string().min(1, { message: '인스타그램 아이디를 입력해주세요' }),
});

export default function ProfileEditPage() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '송현수',
      birthday: '20040129',
      gender: 'female',
      university: '한밭대학교',
      mbti: 'ENFP',
      instagramId: 'hyunsu_0129',
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    // TODO: API 연동
    router.back();
  });

  const handlePhotoChange = () => {
    // TODO: 사진 변경 로직 구현
    console.log('사진 변경');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between mb-6 relative">
            <Pressable onPress={() => router.push('/my')} className="p-2 -ml-2">
              <ChevronLeftIcon width={24} height={24} />
            </Pressable>
            <Text size="lg" weight="semibold" textColor="black" className="absolute left-1/2 -translate-x-1/2">
              프로필
            </Text>
            <Pressable onPress={onSubmit}>
              <Text size="md" weight="semibold" textColor="black">저장</Text>
            </Pressable>
          </View>

          <View className="mb-8">
            <View className="items-center mb-4">
              <View className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-2">
                <Image
                  source={require('@assets/images/image.png')}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
              <Button variant="secondary" className="py-1" onPress={handlePhotoChange}>
                사진 변경
              </Button>
            </View>
          </View>

          <View className="flex gap-y-6">
            <Form.LabelInput
              name="name"
              control={form.control}
              label="이름"
              placeholder="이름을 입력하세요"
            />

            <View className="flex-row gap-x-4">
              <Form.LabelInput
                name="birthday"
                control={form.control}
                label="생년월일"
                placeholder="생년월일 6자리"
                maxLength={6}
                inputMode="numeric"
                className="flex-1"
              />
              <View className="flex-1">
                <Text className="text-sm mb-2 font-medium">성별</Text>
                <Selector
                  value={form.watch('gender')}
                  options={[
                    { label: '남성', value: 'male' },
                    { label: '여성', value: 'female' },
                  ]}
                  onChange={(value) => form.setValue('gender', value as 'male' | 'female')}
                />
              </View>
            </View>

            <Form.LabelInput
              name="university"
              control={form.control}
              label="대학교"
              placeholder="대학교를 입력하세요"
            />

            <Form.LabelInput
              name="mbti"
              control={form.control}
              label="MBTI"
              placeholder="MBTI를 입력하세요"
              maxLength={4}
              autoCapitalize="characters"
            />

            <Form.LabelInput
              name="instagramId"
              control={form.control}
              label="인스타그램 아이디"
              placeholder="인스타그램 아이디를 입력하세요"
            />
          </View>
        </View>
      </ScrollView>

      {!isKeyboardVisible && (
        <View className="px-5 py-4 border-t border-gray-200">
          <Button onPress={onSubmit} disabled={!isValid}>
            저장하기
          </Button>
        </View>
      )}
    </KeyboardAvoidingView>
  );
} 