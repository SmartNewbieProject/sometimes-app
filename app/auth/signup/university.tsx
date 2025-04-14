import Signup from '@/src/features/signup';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { Button, Divider, Lottie } from '@/src/shared/ui';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Text } from '@/src/shared/ui/text';
import { ChipSelector, LabelInput } from '@/src/widgets';
import { Image } from 'expo-image';
import { router, useGlobalSearchParams } from 'expo-router';
import { Suspense, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';

const { SignupSteps, useChangePhase, useSignupProgress, queries } = Signup;
const { useUnivQuery } = queries;


export default function UniversityPage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const { data: univs = [] } = useUnivQuery();
  const params = useGlobalSearchParams();
  console.log(params);
  const [selectedUniv, setSelectedUniv] = useState<string | undefined>(userForm.universityName);
  const filteredUnivs = univs.filter((univ) => univ.startsWith(selectedUniv || ''));
  useChangePhase(SignupSteps.UNIVERSITY);

  const onNext = () => {
    if (!selectedUniv) {
      return;
    }
    updateForm({
      ...userForm,
      universityName: selectedUniv,
    });
    router.push(`/auth/signup/university-details?universityName=${selectedUniv}`);
  };

  const nextable = (() => {
    if (!selectedUniv) {
      return false;
    }
    return univs.includes(selectedUniv);
  })();

  const nextButtonMessage = (() => {
    if (!nextable) {
      return '조금만 더 알려주세요';
    }
    return '다음으로';
  })();


  return (
    <KeyboardAvoidingView
      className="flex-1 flex flex-col">
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

      <View className="px-5 flex flex-col gap-y-[14px] mt-[8px] flex-1">
        <LabelInput
          label="대학교"
          size="sm"
          value={selectedUniv}
          placeholder="대학교를 입력하세요"
          onChangeText={setSelectedUniv}
        />
        <Suspense fallback={<Lottie />}>
          <View className="w-full">
            <ChipSelector
              value={selectedUniv}
              options={filteredUnivs.map((univ) => ({ label: univ, value: univ }))}
              onChange={setSelectedUniv}
              className="w-full"
            />
          </View>
        </Suspense>
      </View>

      <View className={cn(
        platform({
          web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
          android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          default: () => ""
        })
      )}>
        <Button variant="secondary" onPress={() => router.push('/auth/signup/profile-image')} className="flex-[0.3]">
            뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
          {nextButtonMessage}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
