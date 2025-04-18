import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Animated } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button, ImageSelector } from '@/src/shared/ui';
import { Form } from '@/src/widgets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Selector } from '@/src/widgets/selector';
import { useState } from 'react';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg';
import { ToggleTab, type Tab } from '@/src/features/profile-edit/ui';

const TABS: Tab[] = [
  { id: 'profile', label: '나의 프로필' },
  { id: 'ideal', label: '이상형' },
];

type FormState = {
  name: string;
  birthday: string;
  gender: 'male' | 'female';
  university: string;
  mbti: string;
  instagramId: string;
  profileImages: (string | null)[];
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
  profileImages: z.array(z.string().nullable()).length(3),
});

export default function ProfileEditPage() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'ideal'>('profile');
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const fadeAnim = useState(() => ({
    profile: new Animated.Value(1),
    ideal: new Animated.Value(0),
  }))[0];
  
  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '송현수',
      birthday: '20040129',
      gender: 'female',
      university: '한밭대학교',
      mbti: 'ENFP',
      instagramId: 'hyunsu_0129',
      profileImages: [null, null, null],
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    // TODO: API 연동
    router.back();
  });

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    form.setValue('profileImages', newImages);
  };

  const handleTabChange = (tabId: 'profile' | 'ideal') => {
    const fadeOut = Animated.timing(fadeAnim[activeTab], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    });
    const fadeIn = Animated.timing(fadeAnim[tabId], {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    });

    Animated.parallel([fadeOut, fadeIn]).start();
    setActiveTab(tabId);
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

          <ToggleTab
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tabId: string) => handleTabChange(tabId as 'profile' | 'ideal')}
            className="mb-8 self-center"
            style={{ width: 180 }}
          />

          <View className="relative flex-1">
            <Animated.View style={{ 
              position: 'absolute',
              width: '100%',
              opacity: fadeAnim.profile,
              pointerEvents: activeTab === 'profile' ? 'auto' : 'none'
            }}>
              <View className="mb-8">
                <View className="flex flex-row justify-center gap-x-4">
                  {images.map((image, index) => (
                    <ImageSelector
                      key={index}
                      size="sm"
                      value={image ?? undefined}
                      onChange={(value) => handleImageChange(index, value)}
                    />
                  ))}
                </View>
              </View>

              <View className="flex gap-y-6">
                <Form.LabelInput
                  name="name"
                  control={form.control}
                  label="이름"
                  textColor="black"
                  placeholder="이름을 입력하세요"
                />

                <View className="flex-row gap-x-4">
                  <Form.LabelInput
                    name="birthday"
                    control={form.control}
                    label="생년월일"
                    textColor="black"
                    placeholder="생년월일 6자리"
                    maxLength={6}
                    inputMode="numeric"
                    className="flex-1"
                  />
                  <View className="w-[200px]">
                    <Text className="text-md mb-2 font-bold text-black">성별</Text>
                    <Selector
                      value={form.watch('gender')}
                      options={[
                        { label: '남성', value: 'male' },
                        { label: '여성', value: 'female' },
                      ]}
                      onChange={(value) => form.setValue('gender', value as 'male' | 'female')}
                      buttonProps={{
                        className: "px-8"
                      }}
                    />
                  </View>
                </View>

                <Form.LabelInput
                  name="university"
                  control={form.control}
                  label="대학교"
                  textColor="black"
                  placeholder="대학교를 입력하세요"
                />

                <Form.LabelInput
                  name="mbti"
                  control={form.control}
                  label="MBTI"
                  textColor="black"
                  placeholder="MBTI를 입력하세요"
                  maxLength={4}
                  autoCapitalize="characters"
                />

                <Form.LabelInput
                  name="instagramId"
                  control={form.control}
                  label="인스타그램 아이디"
                  textColor="black"
                  placeholder="인스타그램 아이디를 입력하세요"
                />
              </View>
            </Animated.View>

            <Animated.View style={{ 
              position: 'absolute',
              width: '100%',
              opacity: fadeAnim.ideal,
              pointerEvents: activeTab === 'ideal' ? 'auto' : 'none'
            }}>
              <View className="mb-8">
                <View className="items-center mb-4">
                  <View className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <Image
                      source={require('@assets/images/image.png')}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </View>
                  <Button variant="secondary" className="py-1" onPress={() => {}}>
                    사진 변경
                  </Button>
                </View>
              </View>

              <View className="flex gap-y-6">
                <Text>이상형 정보 입력 폼이 여기에 들어갈 예정입니다.</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 