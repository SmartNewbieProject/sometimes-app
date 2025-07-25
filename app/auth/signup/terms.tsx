import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import { Image } from 'expo-image';
import { Divider, Button, Check } from '@/src/shared/ui';
import { CheckboxLabel } from '@/src/widgets';
import { router } from 'expo-router';
import { useState } from 'react';
import { debounce } from '@/src/shared/libs/debounce';
import Signup from '@/src/features/signup';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import { environmentStrategy } from '@/src/shared/libs';


const { useSignupProgress, SignupSteps, useChangePhase, useSignupAnalytics } = Signup;

export default function TermsScreen() {
  const { updateStep, agreements, updateAgreements } = useSignupProgress();
  const allAgreement = agreements.every(agreement => agreement.checked);
  useChangePhase(SignupSteps.TERMS);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics('terms');

  const onBack = () => {
    trackSignupEvent('back_button_click');
    environmentStrategy({
      production: () => router.navigate('/event/pre-signup'),
      development: () => router.navigate('/auth/login'),
    });
  };

  const isNext = agreements
    .filter(agreement => agreement.required)
    .every(agreement => agreement.checked);

  const onNext = () => {
    if (!isNext) return;
    trackSignupEvent('next_button_click', 'to_university');
    updateStep(SignupSteps.UNIVERSITY);
    router.push('/auth/signup/university');
  }

  const handleAgreement = debounce((id: string, value: boolean) => {
    trackSignupEvent('agreement_change', `${id}:${value}`);
    updateAgreements(
      agreements.map(agreement => agreement.id === id ? { ...agreement, checked: value } : agreement)
    );
  }, 100);

  const handleAllAgreement = debounce(() => {
    trackSignupEvent('all_agreement_change', `${!allAgreement}`);
    updateAgreements(
      agreements.map(agreement => ({ ...agreement, checked: !allAgreement }))
    );
  }, 100);

  return (
    <View className="flex-1 flex flex-col">
      <PalePurpleGradient />
      <View className="px-5 flex-1 mt-[20px]">
        <Image
          source={require('@assets/images/terms.png')}
          style={{ width: 81, height: 81 }}
        />
        <Text weight="semibold" size="20" textColor="black">
          서비스 이용을 위해
        </Text>
        <Text weight="semibold" size="20" textColor="black">
          약관 동의가 필요해요
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAllAgreement}
          delayPressIn={0}
        >
          <View className="flex flex-row gap-x-[10px] mt-[16px] mb-[10px]">
            <Check.Box
              checked={allAgreement}
              onChange={handleAllAgreement}
            />
            <Text weight="semibold" size="20" textColor="black">
              모두 동의합니다.
            </Text>
          </View>
        </TouchableOpacity>
        <View className="mb-[10px] flex flex-col ml-[35px]">
          <Text weight="light" size="13" textColor="pale-purple">
            "모두 동의"는 필수 및 선택 약관에 전부 동의하는 거예요.
          </Text>
          <Text weight="light" size="13" textColor="pale-purple">
            개별적으로 선택해서 동의하실 수도 있어요.
          </Text>
        </View>

        <Divider.Horizontal />

        <View className={cn(
          platform({
            web: () => "flex flex-col gap-y-[14px] mt-[14px]",
            android: () => "flex flex-col gap-y-[22px] mt-[20px]",
            ios: () => "flex flex-col gap-y-[22px] mt-[20px]",
            default: () => ""
          })
        )}>
          {agreements.map((agreement) => (
            <CheckboxLabel
              key={agreement.id}
              variant="symbol"
              label={agreement.label}
              checked={agreement.checked}
              onChange={() => handleAgreement(agreement.id, !agreement.checked)}
              link={agreement.link}
            />
          ))}
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
        <Button variant="secondary" onPress={onBack} className="flex-[0.3]">
          뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!isNext}>
          동의하고 계속하기
        </Button>
      </View>
    </View>
  );
}
