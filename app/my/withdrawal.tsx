import Layout from "@/src/features/layout";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { Header } from "@/src/shared/ui/header";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ImageResource, Show, Text, TextArea } from "@shared/ui";
import { axiosClient, ImageResources, tryCatch } from "@/src/shared/libs";
import { TwoButtons } from "@/src/features/layout/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/src/widgets";
import { useState } from "react";
import z from "zod";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
export enum WithdrawalReason {
  FOUND_PARTNER = 'FOUND_PARTNER',
  POOR_MATCHING = 'POOR_MATCHING',
  PRIVACY_CONCERN = 'PRIVACY_CONCERN',
  SAFETY_CONCERN = 'SAFETY_CONCERN',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
  INACTIVE_USAGE = 'INACTIVE_USAGE',
  DISSATISFIED_SERVICE = 'DISSATISFIED_SERVICE',
  OTHER = 'OTHER'
}

const withdrawalReasons = [
  {
    label: '파트너를 찾았어요',
    value: WithdrawalReason.FOUND_PARTNER,
  },
  {
    label: '매칭이 부정확해요',
    value: WithdrawalReason.POOR_MATCHING,
  },
  {
    label: '개인정보 보호가 걱정돼요',
    value: WithdrawalReason.PRIVACY_CONCERN,
  },
  {
    label: '안전성 문제가 있어요',
    value: WithdrawalReason.SAFETY_CONCERN,
  },
  {
    label: '기술적인 문제가 있어요',
    value: WithdrawalReason.TECHNICAL_ISSUES,
  },
  {
    label: '서비스 사용이 불편해요',
    value: WithdrawalReason.INACTIVE_USAGE,
  },
  {
    label: '서비스 만족도가 낮아요',
    value: WithdrawalReason.DISSATISFIED_SERVICE,
  },
  {
    label: '기타',
    value: WithdrawalReason.OTHER,
  },
];

type WithdrawalForm = {
  reason: WithdrawalReason | string;
};

const schema = z.object({
  reason: z.string().min(3, { message: '이유를 선택해주세요' }),
});

const withdraw = async (reason: string) =>
  axiosClient.delete('/user/withdrawl', {
    data: { reason },
  });

export default function WithdrawalScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { isValid }, watch } = useForm<WithdrawalForm>({
    defaultValues: {
      reason: '',
    },
    resolver: zodResolver(schema),
  });
  const [otherReason, setOtherReason] = useState('');
  const { showErrorModal, showModal } = useModal();
  const { logoutOnly } = useAuth();
  const isOther = watch('reason') === 'OTHER';

  const onSubmitWithdrawal = handleSubmit(async (data) => {
    const reason = (() => {
      return isOther ? otherReason : data.reason;
    })();

    await tryCatch(async () => {
      await withdraw(reason);
      await logoutOnly();
  
      showModal({
        title: '다음에 다시봐요',
        children: (
          <View className="flex flex-col gap-y-2">
            <Text textColor="black">
              회원 탈퇴가 완료되었습니다.
            </Text>
            <Text textColor="black">
              다음에 다시 만나요
            </Text>
          </View>
        ),
        primaryButton: {
          text: '확인',
          onClick: () => router.navigate('/auth/login'),
        }
      });
    }, ({ error }) => {
      console.log(error);
      showErrorModal(error, 'error')
    })
  });

  return (
    <Layout.Default className="flex h-full flex-col">
        <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton onPress={() => router.navigate('/my')} visible />
        </Header.LeftContent>
      </Header.Container>

      <View className="flex flex-col px-4 pb-4 gap-y-2.5">
        <View>
          <ImageResource
            resource={ImageResources.PLITE_FOX}
            width={140}
            height={140}
          />
        </View>
        <Text size="lg" textColor="purple" weight="bold">
          다음에 다시 만나요
        </Text>
      </View>

      <View className="flex-1 flex flex-col px-4 pb-4">
        <Form.Select
          control={control}
          name="reason"
          options={withdrawalReasons}
        />
        <Show when={isOther}>
          <TextArea
            value={otherReason}
            onChangeText={setOtherReason}
            placeholder="기타 이유를 입력해주세요"
          />
        </Show>
      </View>

      <TwoButtons
        content={{
          prev: '돌아기기',
          next: '서비스 떠나기',
        }}
        onClickPrevious={() => router.navigate('/my')}
        onClickNext={onSubmitWithdrawal}
        disabledNext={!isValid}
      />

    </Layout.Default>
  );
} 