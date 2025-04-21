import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Animated } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { Button, ImageSelector, Divider } from '@/src/shared/ui';
import { Form } from '@/src/widgets';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Selector } from '@/src/widgets/selector';
import { useState } from 'react';
import ChevronLeftIcon from '@assets/icons/chevron-left.svg';
import { ToggleTab, type Tab } from '@/src/features/profile-edit/ui';
import { ChipSelector } from '@/src/widgets';
import ProfileEdit from '@/src/features/profile-edit';
import { StepIndicator } from '@/src/widgets';
import { MbtiSelector } from '@/src/widgets/mbti-selector';
import Loading from "@/src/features/loading";

const { queries: { usePreferenceOptionsQuery, PreferenceKeys } } = ProfileEdit;

const TABS: Tab[] = [
  { id: 'profile', label: '나의 프로필' },
  { id: 'ideal', label: '이상형' },
];

const AGE_PREFERENCE_OPTIONS = [
  { label: '동갑', value: 'same_age' },
  { label: '연상', value: 'older' },
  { label: '연하', value: 'younger' },
  { label: '상관없음', value: 'any' },
];

const DRINKING_OPTIONS = [
  { label: '술 마시지 않음', value: 'none' },
  { label: '가끔 마심', value: 'sometimes' },
  { label: '자주 마심', value: 'often' },
];

const SMOKING_OPTIONS = [
  { label: '흡연', value: 'yes' },
  { label: '비흡연', value: 'no' },
  { label: '상관없음', value: 'any' },
];

const TATTOO_OPTIONS = [
  { label: '있음', value: 'yes' },
  { label: '없음', value: 'no' },
  { label: '상관없음', value: 'any' },
];

type FormState = {
  name: string;
  birthday: string;
  gender: 'male' | 'female';
  university: string;
  mbti: string;
  instagramId: string;
  profileImages: (string | null)[];
  idealAgePreference: string;
  idealDrinking: string;
  idealLifestyle: string[];
  idealMbti: string;
  idealSmoking: string;
  idealTattoo: string;
};

const schema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }),
  birthday: z.string()
    .max(6, { message: '생년월일 6자리' })
    .regex(/^\d+$/, { message: '숫자만 입력해주세요' }),
  gender: z.enum(['male', 'female']),
  university: z.string().min(1, { message: '대학교를 입력하세요' }),
  mbti: z.string().min(4, { message: 'MBTI를 입력하세요' }),
  instagramId: z.string().min(1, { message: '인스타그램 아이디를 입력하세요' }),
  profileImages: z.array(z.string().nullable()).length(3),
  idealAgePreference: z.string(),
  idealDrinking: z.string(),
  idealLifestyle: z.array(z.string()),
  idealMbti: z.string(),
  idealSmoking: z.string(),
  idealTattoo: z.string(),
});

export default function ProfileEditPage() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'ideal'>('profile');
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const fadeAnim = useState(() => ({
    profile: new Animated.Value(1),
    ideal: new Animated.Value(0),
  }))[0];
  
  const { data: lifestylePreferences = { id: '', options: [] }, isLoading: isLifestyleLoading } = usePreferenceOptionsQuery(PreferenceKeys.LIFESTYLE);
  
  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '송현수',
      birthday: '040129',
      gender: 'female',
      university: '한밭대학교',
      mbti: 'ENFP',
      instagramId: 'hyunsu_0129',
      profileImages: [null, null, null],
      idealAgePreference: 'any',
      idealDrinking: 'none',
      idealLifestyle: [],
      idealMbti: '',
      idealSmoking: 'any',
      idealTattoo: 'any',
    },
  });

  const { handleSubmit, formState: { isValid } } = form;

  const onSubmit = handleSubmit((data) => {
    if (activeTab === 'profile') {
      console.log('프로필 정보:', {
        name: data.name,
        birthday: data.birthday,
        gender: data.gender,
        university: data.university,
        mbti: data.mbti,
        instagramId: data.instagramId,
        profileImages: data.profileImages,
      });
    } else {
      console.log('이상형 정보:', {
        idealAgePreference: data.idealAgePreference,
        idealDrinking: data.idealDrinking,
        idealLifestyle: data.idealLifestyle,
        idealMbti: data.idealMbti,
        idealSmoking: data.idealSmoking,
        idealTattoo: data.idealTattoo,
      });
    }
    // TODO: API 연동
    router.push('/my');
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

  const handleLifestyleChange = (values: string[]) => {
    if (values.length > 5) {
      return;
    }
    form.setValue('idealLifestyle', values);
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
              opacity: fadeAnim.profile,
              display: activeTab === 'profile' ? 'flex' : 'none'
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
                    className="w-[110px]"
                  />
                  <View className="">
                    <Text className="text-md mb-2 font-bold text-black">성별</Text>
                    <Selector
                      value={form.watch('gender')}
                      options={[
                        { label: '남성', value: 'male' },
                        { label: '여성', value: 'female' },
                      ]}
                      onChange={(value) => form.setValue('gender', value as 'male' | 'female')}
                      buttonProps={{
                        className: "flex-1"
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
              opacity: fadeAnim.ideal,
              display: activeTab === 'ideal' ? 'flex' : 'none'
            }}>
              <View className="flex gap-y-12">
                <View>
                  <Text weight="semibold" size="md" textColor="black" className="mb-2">
                    나이 선호도
                  </Text>
                  <Controller
                    name="idealAgePreference"
                    control={form.control}
                    render={({ field: { value, onChange } }) => (
                      <Selector
                        value={value}
                        options={AGE_PREFERENCE_OPTIONS}
                        onChange={onChange}
                        direction="horizontal"
                        className="flex-row flex-wrap gap-1"
                        buttonProps={{
                          className: 'flex-1 basis-[23%] h-[40px]',
                          size: 'sm'
                        }}
                      />
                    )}
                  />
                </View>

                <View>
                  <Text weight="semibold" size="md" textColor="black" className="mb-2">
                    음주 선호도
                  </Text>
                  <Controller
                    name="idealDrinking"
                    control={form.control}
                    render={({ field: { value, onChange } }) => (
                      <Selector
                        value={value}
                        options={DRINKING_OPTIONS}
                        onChange={onChange}
                        direction="horizontal"
                        className="flex-row flex-wrap gap-2"
                        buttonProps={{
                          className: 'flex-1 basis-[23%] h-[40px]',
                          size: 'sm'
                        }}
                      />
                    )}
                  />
                </View>

                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text weight="semibold" size="md" textColor="black">
                      라이프스타일
                    </Text>
                    <StepIndicator
                      length={5}
                      step={form.watch('idealLifestyle').length}
                      dotGap={4}
                      dotSize={16}
                    />
                  </View>
                  <Divider.Horizontal className="mb-4" />
                  <Loading.Lottie
                    title="라이프스타일을 불러오고 있어요"
                    loading={isLifestyleLoading}
                  >
                    <Controller
                      name="idealLifestyle"
                      control={form.control}
                      render={({ field: { value, onChange } }) => (
                        <ChipSelector
                          value={value}
                          options={lifestylePreferences.options.map((option) => ({
                            label: option.displayName,
                            value: option.id,
                            imageUrl: option?.imageUrl
                          }))}
                          onChange={handleLifestyleChange}
                          multiple
                          align="center"
                          className="w-full"
                        />
                      )}
                    />
                  </Loading.Lottie>
                </View>

                <View>
                  <Text weight="semibold" size="md" textColor="black" className="mb-2">
                    MBTI
                  </Text>
                  <Controller
                    name="idealMbti"
                    control={form.control}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <MbtiSelector
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </View>

                <View>
                  <Text weight="semibold" size="md" textColor="black" className="mb-2">
                    흡연 선호도
                  </Text>
                  <Controller
                    name="idealSmoking"
                    control={form.control}
                    render={({ field: { value, onChange } }) => (
                      <Selector
                        value={value}
                        options={SMOKING_OPTIONS}
                        onChange={onChange}
                        direction="horizontal"
                        className="flex-row flex-wrap gap-2"
                        buttonProps={{
                          className: 'flex-1 basis-[23%] h-[40px]',
                          size: 'sm'
                        }}
                      />
                    )}
                  />
                </View>

                <View>
                  <Text weight="semibold" size="md" textColor="black" className="mb-2">
                    문신 선호도
                  </Text>
                  <Controller
                    name="idealTattoo"
                    control={form.control}
                    render={({ field: { value, onChange } }) => (
                      <Selector
                        value={value}
                        options={TATTOO_OPTIONS}
                        onChange={onChange}
                        direction="horizontal"
                        className="flex-row flex-wrap gap-2"
                        buttonProps={{
                          className: 'flex-1 basis-[23%] h-[40px]',
                          size: 'sm'
                        }}
                      />
                    )}
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 