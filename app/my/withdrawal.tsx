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
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";
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
    label: i18n.t("apps.my.withdrawal.reason_partner"),
    value: WithdrawalReason.FOUND_PARTNER,
  },
  {
    label: i18n.t("apps.my.withdrawal.reason_poor_matching"),
    value: WithdrawalReason.POOR_MATCHING,
  },
  {
    label: i18n.t("apps.my.withdrawal.reason_privacy"),
    value: WithdrawalReason.PRIVACY_CONCERN,
  },
  {
    label: i18n.t("apps.my.withdrawal.reason_safety"),
    value: WithdrawalReason.SAFETY_CONCERN,
  },
  {
    label: i18n.t("apps.my.withdrawal.reason_technical"),
    value: WithdrawalReason.TECHNICAL_ISSUES,
  },
  {
    label:i18n.t("apps.my.withdrawal.reason_inactive"),
    value: WithdrawalReason.INACTIVE_USAGE,
  },
  {
    label:i18n.t("apps.my.withdrawal.reason_dissatisfied"),
    value: WithdrawalReason.DISSATISFIED_SERVICE,
  },
  {
    label: i18n.t("apps.my.withdrawal.reason_other"),
    value: WithdrawalReason.OTHER,
  },
];

type WithdrawalForm = {
  reason: WithdrawalReason | string;
};

const schema = z.object({
  reason: z.string().min(3, { message: i18n.t("apps.my.withdrawal.reason_select_error") }),
});

const withdraw = async (reason: string) =>
  axiosClient.delete('/user/withdrawl', {
    data: { reason },
  });

export default function WithdrawalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { control, handleSubmit, formState: { isValid }, watch } = useForm<WithdrawalForm>({
    defaultValues: {
      reason: '',
    },
    resolver: zodResolver(schema),
  });
  const [otherReason, setOtherReason] = useState('');
  const { showErrorModal, showModal } = useModal();
  const { clearTokensOnly } = useAuth();
  const isOther = watch('reason') === 'OTHER';

  const onSubmitWithdrawal = handleSubmit(async (data) => {
    const reason = (() => {
      return isOther ? otherReason : data.reason;
    })();

    await tryCatch(async () => {
      await withdraw(reason);
      await clearTokensOnly();
  
      showModal({
        title: t("apps.my.withdrawal.complete_title"),
        children: (
          <View className="flex flex-col gap-y-2">
            <Text textColor="black">
              {t("apps.my.withdrawal.complete_desc_1")}
            </Text>
            <Text textColor="black">
              {t("apps.my.withdrawal.complete_desc_2")}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t("global.confirm"),
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
          {t("apps.my.withdrawal.title")}
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
            placeholder={t("apps.my.withdrawal.textarea_placeholder")}
          />
        </Show>
      </View>

      <TwoButtons
        content={{
          prev: t("apps.my.withdrawal.button_prev"),
          next: t("apps.my.withdrawal.button_next"),
        }}
        onClickPrevious={() => router.navigate('/my')}
        onClickNext={onSubmitWithdrawal}
        disabledNext={!isValid}
      />

    </Layout.Default>
  );
} 