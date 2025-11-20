import { Header, Text, PalePurpleGradient } from "@/src/shared/ui";
import { LabelInput } from "@/src/widgets/label-input";
import { router } from "expo-router";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Pressable,
  Linking,
} from "react-native";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { useState } from "react";
import {
  sendEmailVerification,
  verifyEmailCode,
  getProfileId,
  MESSAGES,
  UI_CONSTANTS,
} from "@/src/features/university-verification";

export default function UniversityVerificationScreen() {
  const { showModal } = useModal();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleEmailVerification = async () => {
    if (!email.trim()) {
      showModal({
        title: "알림",
        children: MESSAGES.EMAIL_REQUIRED,
        primaryButton: {
          text: "확인",
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
          title: "인증번호 전송",
          children: MESSAGES.CODE_SENT,
          primaryButton: {
            text: "확인",
            onClick: () => {},
          },
        });
      },
      (error) => {
        showModal({
          title: "오류",
          children: error.error,
          primaryButton: {
            text: "확인",
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
        title: "알림",
        children: MESSAGES.FIELDS_REQUIRED,
        primaryButton: {
          text: "확인",
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
          throw new Error(MESSAGES.USER_INFO_ERROR);
        }

        await verifyEmailCode(email, verificationCode, profileId);

        setIsVerified(true);
        showModal({
          title: "인증 완료",
          children: MESSAGES.VERIFICATION_SUCCESS,
          primaryButton: {
            text: "확인",
            onClick: () => {},
          },
        });
      },
      (error) => {
        showModal({
          title: "인증 실패",
          children: error.error || MESSAGES.VERIFICATION_FAILED,
          primaryButton: {
            text: "확인",
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

  const handleIDcardCertification = () => {
    router.push("/university-verification/idcard");
  };

  const handleConfirm = () => {
    if (!isVerified) {
      showModal({
        title: "알림",
        children: MESSAGES.NOT_VERIFIED,
        primaryButton: {
          text: "확인",
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
          <Text size="lg" weight="normal" textColor="black">
            대학 인증
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
                    placeholder="학교 이메일 주소"
                    size="sm"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleEmailVerification}
                  disabled={isLoading}
                  className={`bg-surface-background border border-purple-400 rounded-2xl w-28 h-8 justify-center items-center ${
                    isLoading ? "opacity-50" : ""
                  }`}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    className="text-center"
                  >
                    {isLoading ? "전송중..." : "인증번호 전송"}
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
                    placeholder="인증번호 입력"
                    size="sm"
                    maxLength={UI_CONSTANTS.VERIFICATION_CODE_MAX_LENGTH}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleCodeVerification}
                  disabled={isLoading}
                  className={`bg-surface-background border border-purple-400 rounded-2xl px-2 w-28 h-8 justify-center items-center ${
                    isLoading ? "opacity-50" : ""
                  }`}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    className="text-center"
                  >
                    {isLoading ? "확인중..." : "확인"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-5 mb-4">
          <Text size="sm" weight="normal" className="text-gray">
            학교 이메일이 없는 경우
          </Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity onPress={handleIDcardCertification}>
              <Text size="sm" weight="normal" className="text-gray underline">
                학생증 및 재학증명 제출
              </Text>
            </TouchableOpacity>
            <Text size="sm" weight="normal" className="text-gray">
              을 통해 재학 정보를 인증 받을 수 있어요.
            </Text>
          </View>
          <View className="mt-4">
            <Text size="sm" weight="normal" className="text-gray">
              재학 인증에 어려움이 있는 경우
            </Text>
            <View className="flex-row flex-wrap">
              <TouchableOpacity onPress={handleDMClick}>
                <Text size="sm" weight="normal" className="text-gray underline">
                  DM
                </Text>
              </TouchableOpacity>
              <Text size="sm" weight="normal" className="text-gray">
                으로 문의 주시면 확인 후 도와드립니다.
              </Text>
            </View>
          </View>
        </View>

        {/* 하단 완료 버튼 */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            onPress={handleConfirm}
            className="w-full bg-darkPurple rounded-2xl h-[50px] justify-center items-center"
          >
            <Text size="md" weight="normal" textColor="white">
              대학 인증 완료하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
