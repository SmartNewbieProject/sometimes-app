import { useAuth } from "@/src/features/auth/hooks/use-auth";
import Layout from "@/src/features/layout";
import { TwoButtons } from "@/src/features/layout/ui";
import { useModal } from "@/src/shared/hooks/use-modal";
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
    label: "파트너를 찾았어요",
    value: WithdrawalReason.FOUND_PARTNER,
  },
  {
    label: "매칭이 부정확해요",
    value: WithdrawalReason.POOR_MATCHING,
  },
  {
    label: "개인정보 보호가 걱정돼요",
    value: WithdrawalReason.PRIVACY_CONCERN,
  },
  {
    label: "안전성 문제가 있어요",
    value: WithdrawalReason.SAFETY_CONCERN,
  },
  {
    label: "기술적인 문제가 있어요",
    value: WithdrawalReason.TECHNICAL_ISSUES,
  },
  {
    label: "서비스 사용이 불편해요",
    value: WithdrawalReason.INACTIVE_USAGE,
  },
  {
    label: "서비스 만족도가 낮아요",
    value: WithdrawalReason.DISSATISFIED_SERVICE,
  },
  {
    label: "기타",
    value: WithdrawalReason.OTHER,
  },
];

type WithdrawalForm = {
  reason: WithdrawalReason | string;
};

const schema = z.object({
  reason: z.string().min(3, { message: "이유를 선택해주세요" }),
});

const withdraw = async (reason: string) =>
  axiosClient.delete("/user/withdrawl", {
    data: { reason },
  });

export default function WithdrawalScreen() {
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
  const { clearTokensOnly } = useAuth();
  const isOther = watch("reason") === "OTHER";

  const onSubmitWithdrawal = handleSubmit(async (data) => {
    const reason = (() => {
      return isOther ? otherReason : data.reason;
    })();

    await tryCatch(
      async () => {
        await withdraw(reason);
        await clearTokensOnly();

        showModal({
          title: "다음에 다시봐요",
          children: (
            <View className="flex flex-col gap-y-2">
              <Text textColor="black">회원 탈퇴가 완료되었습니다.</Text>
              <Text textColor="black">다음에 다시 만나요</Text>
            </View>
          ),
          primaryButton: {
            text: "확인",
            onClick: () => router.navigate("/auth/login"),
          },
        });
      },
      ({ error }) => {
        console.log(error);
        showErrorModal(error, "error");
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
            탈퇴하기
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
            썸타임을 아껴주셔서 감사합니다
          </Text>
          <RNText style={styles.description}>
            느끼셨던 점을 공유해주시면 더욱 좋은 서비스를 제공할 수 있도록
            하겠습니다.
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
          서비스 떠나기
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
