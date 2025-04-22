import { View } from 'react-native';
import { Image } from 'expo-image';
import { Button, Text, PalePurpleGradient, Show } from '@shared/ui';
import { router } from 'expo-router';
import Signup from '@features/signup';
import { Form } from '@/src/widgets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';
import Layout from '@features/layout';
import { useEffect, useState } from 'react';
import { ImageResources, imageUtils, tryCatch } from '@shared/libs';
import { useModal } from '@shared/hooks/use-modal';
import Loading from '@features/loading';
import { useKeyboarding } from '@shared/hooks';

const { SignupSteps, useChangePhase, schemas, useSignupProgress, apis } = Signup;

type FormState = {
  phoneNumber: string;
  authorizationCode: string;
}

export default function PhoneScreen() {
  const { isKeyboardVisible } = useKeyboarding();
  const { updateForm, form: formStates, completeSms, smsComplete } = useSignupProgress();
  const [sendedSms, setSendedSms] = useState(false);
  const { showModal, showErrorModal } = useModal();
  const [loadingApi, setLoadingApi] = useState(false);

  const form = useForm<FormState>({
    resolver: zodResolver(schemas.phone),
    mode: 'onChange',
    defaultValues: {
      phoneNumber: formStates.phoneNumber ?? '',
    },
  });
  const { handleSubmit, formState: { isValid }, watch, setValue } = form;
  const phoneNumberValue = watch('phoneNumber');

  const onNext = handleSubmit(async ({ authorizationCode }) => {
    const next = () => router.push('/auth/signup/profile');
    setLoadingApi(true);
    await tryCatch(async () => {
      await apis.authenticateSmsCode({
        authorizationCode,
        uniqueKey: formStates.smsUniqueKey!,
      });
      showModal({
        title: "인증 성공!",
        children: (
          <View className="flex flex-col gap-y-2">
            <Text size="sm" textColor="black">휴대폰 인증에 성공했어요!</Text>
            <Text size="sm" textColor="black">다음 화면으로 이동할게요.</Text>
          </View>
        ),
        primaryButton: {
          text: "네 이동할게요",
          onClick: () => {
            completeSms();
            next();
          },
        },
      });
    }, error => {
      showErrorModal(error.error, 'error');
    });
    setLoadingApi(false);
  });

  const sendSmsCode = async () => {
    setLoadingApi(true);
    await tryCatch(async () => {
      setSendedSms(true);
      const { uniqueKey } = await apis.sendVerificationCode(phoneNumberValue);
      updateForm({ ...formStates, smsUniqueKey: uniqueKey, phoneNumber: phoneNumberValue });

      showModal({
        title: "인증번호가 발송되었어요",
        children: (
          <View className="flex flex-col gap-y-2">
            <Text size="sm" textColor="black">인증번호가 발송되었어요!</Text>
            <Text size="sm" textColor="black">발송된 인증코드를 입력후 인증버튼을 눌러주세요.</Text>
          </View>
        ),
        primaryButton: {
          text: "네 확인했어요.",
          onClick: () => { },
        },
      });
    }, error => {
      showErrorModal(error.error, "error");
    });
    setLoadingApi(false);
  };

  const isInputPhoneNumber = (() => {
    const matches = phoneNumberValue?.match(/010-\d{3,4}-\d{4}/);
    return !!matches;
  })();

  const nextable = !!isInputPhoneNumber || isValid;
  const renderPhoneAuthButton = !isValid;

  useChangePhase(SignupSteps.PHONE);

  useEffect(() => {
    const phone = formatPhoneNumber(phoneNumberValue);
    setValue('phoneNumber', phone);
  }, [phoneNumberValue]);

  if (loadingApi) {
    return <Loading.Page size={96} />;
  }

  if (smsComplete) {
    return (
      <Layout.Default>
        <View className="flex-1 flex flex-col">
          <PalePurpleGradient />
          <View className="px-5 flex-1">
            <Image
              source={{ uri: imageUtils.get(ImageResources.SMS_CHECK) }}
              style={{ width: 81, height: 81 }}
            />
            <Text weight="semibold" size="20" textColor="black">
              이미 번호 인증이 되었어요!
            </Text>
            <Text weight="semibold" size="20" textColor="black">
              다음화면으로 이동할게요
            </Text>
          </View>
        </View>
        {!isKeyboardVisible && (
          <View className={cn(
            platform({
              web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
              android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
              ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
              default: () => "",
            }),
          )}>
            <Button variant="secondary" onPress={() => router.push('/auth/signup/account')} className="flex-[0.3]">
              뒤로
            </Button>
            <Button onPress={() => router.navigate("/auth/signup/profile")} className="flex-[0.7]">
              다음으로
            </Button>
          </View>
        )}
      </Layout.Default>
    );
  }

  return (
    <Layout.Default>
      <View className="flex-1 flex flex-col">
        <PalePurpleGradient />
        <View className="px-5">
          <Image
            source={{ uri: imageUtils.get(ImageResources.SMS_CHECK) }}
            style={{ width: 81, height: 81 }}
          />
          <Text weight="semibold" size="20" textColor="black">
            이 번호로 문자 한 통 보낼게요!
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            간단한 인증만 해주세요
          </Text>
        </View>

        <View className={cn(
          platform({
            web: () => "px-8 flex flex-col gap-y-[8px] flex-1 mt-[14px]",
            ios: () => "px-8 flex flex-col gap-y-[40px] flex-1 mt-[30px]",
            android: () => "px-8 flex flex-col gap-y-[40px] flex-1 mt-[30px]",
            default: () => ""
          })
        )}>
          <Form.LabelInput
            name="phoneNumber"
            control={form.control}
            label="전화번호"
            size="sm"
            placeholder="010-1234-5678"
          />
          {sendedSms && (
            <Form.LabelInput
              name="authorizationCode"
              control={form.control}
              maxLength={6}
              label="인증코드 확인"
              size="sm"
              placeholder="휴대폰으로 발신된 인증코드를 입력"
            />
          )}
        </View>

        <Show when={!isKeyboardVisible}>
          <View className={cn(
              platform({
                web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
                android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
                ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
                default: () => ""
              }),
            )}>
              <Button variant="secondary" onPress={() => router.push('/auth/signup/account')} className="flex-[0.3]">
                뒤로
              </Button>
              {renderPhoneAuthButton && (
                <Button onPress={sendSmsCode} className="flex-[0.7]" disabled={!nextable}>
                  {!sendedSms ? '인증코드 발송하기' : '코드 재발송하기'}
                </Button>
              )}
              {isValid && (
                <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
                  인증하기
                </Button>
              )}
            </View>
        </Show>

      </View>
    </Layout.Default>
  );
}

const formatPhoneNumber = (value: string) => {
  value = value.replace(/[^\d]/g, '');
  if (value.length <= 3) {
    return value;
  } else if (value.length <= 7) {
    return value.slice(0, 3) + '-' + value.slice(3);
  } else {
    return value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
  }
};