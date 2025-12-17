import Layout from "@/src/features/layout";
import { TwoButtons } from "@/src/features/layout/ui";
import { ImageResources, axiosClient, tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { Header } from "@/src/shared/ui/header";
import { Form } from "@/src/widgets";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ImageResource, Show, Text, TextArea } from "@shared/ui";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Platform,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import z from "zod";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useKpiAnalytics } from "@/src/shared/hooks/use-kpi-analytics";
export enum WithdrawalReason {
  FOUND_PARTNER = "FOUND_PARTNER",
  POOR_MATCHING = "POOR_MATCHING",
  PRIVACY_CONCERN = "PRIVACY_CONCERN",
  SAFETY_CONCERN = "SAFETY_CONCERN",
  TECHNICAL_ISSUES = "TECHNICAL_ISSUES",
  INACTIVE_USAGE = "INACTIVE_USAGE",
  DISSATISFIED_SERVICE = "DISSATISFIED_SERVICE",
  OTHER = "OTHER",
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
  axiosClient.delete("/user/withdrawl", {
    data: { reason },
  });

export default function WithdrawalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
  } = useForm<WithdrawalForm>({
    defaultValues: {
      reason: "",
    },
    resolver: zodResolver(schema),
  });
  const [otherReason, setOtherReason] = useState("");
  const { showErrorModal, showModal } = useModal();
  const { clearTokensOnly, my } = useAuth();
  const { accountEvents } = useKpiAnalytics();
  const isOther = watch("reason") === "OTHER";

  const onSubmitWithdrawal = handleSubmit(async (data) => {
    const reason = (() => {
      return isOther ? otherReason : data.reason;
    })();

    // 탈퇴 요청 시작 이벤트 (버튼 클릭 시)
    accountEvents.trackAccountDeletionRequested(
      reason,
      isOther ? otherReason : undefined
    );

    await tryCatch(
      async () => {
        await withdraw(reason);

        // 탈퇴 완료 이벤트 (사용자 통계 포함)
        accountEvents.trackAccountDeleted(reason, {
          daysSinceSignup: my?.createdAt
            ? Math.floor((Date.now() - new Date(my.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : undefined,
          totalMatchesCount: my?.totalMatches,
          hasPurchased: my?.hasPurchased,
          totalSpent: my?.totalSpent,
          lastActiveDaysAgo: 0,
        });

        await clearTokensOnly();

        showModal({
          title: t("apps.my.withdrawal.modal_title"),
          children: (
            <View className="flex flex-col gap-y-2">
              <Text textColor="black">{t("apps.my.withdrawal.modal_desc_1")}</Text>
              <Text textColor="black">{t("apps.my.withdrawal.modal_desc_2")}</Text>
            </View>
          ),
          primaryButton: {
            text: t("global.confirm"),
            onClick: () => router.navigate("/auth/login"),
          },
        });
      },
      ({ error }) => {
        console.error("Withdrawal error:", {
          error,
          errorMessage: error?.message,
          errorString: error?.error,
          status: error?.status,
          statusCode: error?.statusCode,
          reason,
        });

        const errorMessage = error?.message || error?.error || "회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.";
        showErrorModal(errorMessage, "error");
      }
    );
  });

  return (
    <Layout.Default>
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton
            onPress={() => router.navigate("/setting/account")}
            visible
          />
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="bold" textColor="black">
            {t('features.mypage.withdrawal.header_title')}
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <View />
        </Header.RightContent>
      </Header.Container>
      <ScrollView style={styles.container}>
        <View style={styles.topContainer}>
          <View>
            <Image
              source={require("@assets/images/withdrawal-miho.png")}
              style={styles.image}
            />
          </View>
          <Text size="lg" textColor="black" weight="semibold">
            {t('features.mypage.withdrawal.thank_you')}
          </Text>
          <RNText style={styles.description}>
            {t('features.mypage.withdrawal.feedback_request')}
          </RNText>
        </View>

        <View style={styles.formContainer}>
          <Form.Radio
            control={control}
            name="reason"
            options={withdrawalReasons}
            isOther={isOther}
            otherReason={otherReason}
            onChangeOtherReason={setOtherReason}
          />
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          width="full"
          className="flex-1"
          variant="primary"
          onPress={onSubmitWithdrawal}
          styles={styles.button}
          disabled={!isValid}
        >
          {t('features.mypage.withdrawal.leave_service')}
        </Button>
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  topContainer: {
    marginTop: 20,
    paddingHorizontal: 30,
    marginBottom: 22,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 32,
    ...Platform.select({
      web: {
        marginBottom: 34,
      },
      ios: {
        marginBottom: 54,
      },
      android: {
        marginBottom: 54,
      },
    }),
    flexDirection: "row",
  },
  button: {
    width: "100%",

    justifyContent: "center",
  },
  description: {
    color: "#9B94AB",
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 15.6,
    fontSize: 13,
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  container: {
    paddingBottom: 120,
  },
});
