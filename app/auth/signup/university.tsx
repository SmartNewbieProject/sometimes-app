import Signup from '@features/signup';
import { cn } from '@shared/libs/cn';
import { platform } from '@shared/libs/platform';
import { Text, PalePurpleGradient, Button, Show, Divider } from '@shared/ui';
import { ChipSelector, LabelInput } from '@/src/widgets';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import Loading from "@features/loading";
import { useKeyboarding } from '@shared/hooks';

const { SignupSteps, useChangePhase, useSignupProgress, queries, useSignupAnalytics } = Signup;
const { useUnivQuery } = queries;


export default function UniversityPage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const { data: univs = [], isLoading } = useUnivQuery();
  const { isKeyboardVisible } = useKeyboarding();
  const [selectedUniv, setSelectedUniv] = useState<string | undefined>(userForm.universityName);
  const filteredUnivs = univs.filter((univ) => univ.startsWith(selectedUniv || ''));
  const params = useLocalSearchParams();
  const hasProcessedPassInfo = useRef(false);

  useChangePhase(SignupSteps.UNIVERSITY);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics('university');

  // PASS 인증 정보 처리 (useRef로 한 번만 실행되도록 제어)
  useEffect(() => {
    if (params.certificationInfo && !hasProcessedPassInfo.current) {
      hasProcessedPassInfo.current = true;
      const certInfo = JSON.parse(params.certificationInfo as string);
      updateForm({
        ...userForm,
        passVerified: true,
        name: certInfo.name,
        phone: certInfo.phone,
        gender: certInfo.gender,
        birthday: certInfo.birthday,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.certificationInfo]);

  const onNext = () => {
    if (!selectedUniv) {
      return;
    }
    trackSignupEvent('next_button_click', 'to_university_details');
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
        <Loading.Lottie
          title="학교를 검색중이에요"
          loading={isLoading}
          size={10}
        >
          <View className="w-full">
            <ChipSelector
              value={selectedUniv}
              options={filteredUnivs.map((univ) => ({ label: univ, value: univ }))}
              onChange={setSelectedUniv}
              className="w-full"
            />
          </View>
        </Loading.Lottie>
      </View>

      <Show when={!isKeyboardVisible}>
        <View className={cn(
          platform({
            web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
            android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
            ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
            default: () => ""
          })
        )}>
          <Button variant="secondary" onPress={() => {
            trackSignupEvent('back_button_click', 'to_profile_image');
            router.push('/auth/signup/profile-image');
          }} className="flex-[0.3]">
            뒤로
          </Button>
          <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
            {nextButtonMessage}
          </Button>
        </View>
      </Show>

    </KeyboardAvoidingView>
  );
}
