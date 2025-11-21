import { Header, Text, PalePurpleGradient } from "@/src/shared/ui";
import { LabelInput } from "@/src/widgets/label-input";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View, Pressable, Linking } from "react-native";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { useState } from "react";
import {
  sendEmailVerification,
  verifyEmailCode,
  getProfileId,
  UI_CONSTANTS
} from "@/src/features/university-verification";
import { useTranslation } from "react-i18next";

export default function UniversityVerificationScreen() {
  const { t } = useTranslation();
  const { showModal } = useModal();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleEmailVerification = async () => {
    if (!email.trim()) {
      showModal({
        title: t("apps.university-verification.confirm_button"),
        children: t("apps.university-verification.messages.email_required"),
        primaryButton: {
          text: t("apps.university-verification.confirm_button"),
          onClick: () => {},
        },
      });
      return;
    }

    setIsLoading(true);
    await tryCatch(
      async () => {
        await sendEmailVerification(email);
        showModal({
          title: t("apps.university-verification.send_code_button"),
          children: t("apps.university-verification.messages.code_sent"),
          primaryButton: {
            text: t("apps.university-verification.confirm_button"),
            onClick: () => {},
          },
        });
      },
      (error) => {
        showModal({
          title: t("apps.university-verification.confirm_button"),
          children: error.error,
          primaryButton: {
            text: t("apps.university-verification.confirm_button"),
            onClick: () => {},
          },
        });
      }
    );
    setIsLoading(false);
  };

  const handleCodeVerification = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      showModal({
        title: t("apps.university-verification.confirm_button"),
        children: t("apps.university-verification.messages.fields_required"),
        primaryButton: {
          text: t("apps.university-verification.confirm_button"),
          onClick: () => {},
        },
      });
      return;
    }

    setIsLoading(true);
    await tryCatch(
      async () => {
        const profileId = await getProfileId();

        if (!profileId) {
          throw new Error(
            t("apps.university-verification.messages.user_info_error")
          );
        }

        await verifyEmailCode(email, verificationCode, profileId);

        setIsVerified(true);
        showModal({
          title: t("apps.university-verification.confirm_button"),
          children: t("apps.university-verification.messages.verification_success"),
          primaryButton: {
            text: t("apps.university-verification.confirm_button"),
            onClick: () => {},
          },
        });
      },
      (error) => {
        showModal({
          title: t("apps.university-verification.confirm_button"),
          children:
            error.error ||
            t("apps.university-verification.messages.verification_failed"),
          primaryButton: {
            text: t("apps.university-verification.confirm_button"),
            onClick: () => {},
          },
        });
      }
    );
    setIsLoading(false);
  };

  const handleDMClick = () => {
    Linking.openURL(
      "https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng=="
    );
  };

  const handleConfirm = () => {
    if (!isVerified) {
      showModal({
        title: t("apps.university-verification.confirm_button"),
        children: t("apps.university-verification.messages.not_verified"),
        primaryButton: {
          text: t("apps.university-verification.confirm_button"),
          onClick: () => {},
        },
      });
      return;
    }

    router.push("/university-verification/success");
  };

  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="regular" textColor="black">
            {t("apps.university-verification.header_title")}
          </Text>
        </Header.CenterContent>
        <Header.RightContent></Header.RightContent>
      </Header.Container>

      <View className="flex-1">
        <ScrollView className="flex-1 px-5">
          <View className="mt-8">
            {/* 학교 이메일 주소 입력 섹션 */}
            <View className="mb-8">
              <View className="flex-row items-end gap-x-3">
                <View className="flex-1">
                  <LabelInput
                    label=""
                    placeholder={t(
                      "apps.university-verification.email_input_placeholder"
                    )}
                    size="sm"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleEmailVerification}
                  disabled={isLoading}
                  className={`bg-white border border-purple-400 rounded-2xl w-28 h-8 justify-center items-center ${isLoading ? 'opacity-50' : ''}`}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    className="text-center"
                  >
                    {isLoading
                      ? t("apps.university-verification.sending_code")
                      : t("apps.university-verification.send_code_button")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 인증번호 입력 섹션 */}
            <View className="mb-8">
              <View className="flex-row items-end gap-x-3">
                <View className="flex-1">
                  <LabelInput
                    label=""
                    placeholder={t(
                      "apps.university-verification.code_input_placeholder"
                    )}
                    size="sm"
                    maxLength={UI_CONSTANTS.VERIFICATION_CODE_MAX_LENGTH}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleCodeVerification}
                  disabled={isLoading}
                  className={`bg-white border border-purple-400 rounded-2xl px-2 w-28 h-8 justify-center items-center ${isLoading ? 'opacity-50' : ''}`}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    className="text-center"
                  >
                    {isLoading
                      ? t("apps.university-verification.verifying_code")
                      : t("apps.university-verification.confirm_button")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* DM 인증 안내 */}
        <View className="px-5 mb-4">
          <Text size="sm" weight="regular" className="text-gray">
            {t("apps.university-verification.no_email_guide_1")}
          </Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity onPress={handleDMClick}>
              <Text size="sm" weight="bold" className="text-gray-500">
                {t("apps.university-verification.no_email_guide_2")}
              </Text>
            </TouchableOpacity>
            <Text size="sm" weight="regular" className="text-gray">
              {t("apps.university-verification.no_email_guide_3")}
            </Text>
          </View>
        </View>

        {/* 하단 완료 버튼 */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            onPress={handleConfirm}
            className="w-full bg-darkPurple rounded-2xl h-[50px] justify-center items-center"
          >
            <Text size="md" weight="regular" textColor="white">
              {t("apps.university-verification.complete_verification_button")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
