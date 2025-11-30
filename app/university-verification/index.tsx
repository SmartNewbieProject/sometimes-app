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
import { StyleSheet } from "react-native";

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
    <View style={styles.container}>
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
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

      <View style={styles.content}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* 학교 이메일 주소 입력 섹션 */}
            <View style={styles.section}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
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
                  style={[
                    styles.verifyButton,
                    isLoading && styles.disabledButton
                  ]}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    style={styles.buttonText}
                  >
                    {isLoading ? "전송중..." : "인증번호 전송"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 인증번호 입력 섹션 */}
            <View style={styles.section}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
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
                  style={[
                    styles.confirmButton,
                    isLoading && styles.disabledButton
                  ]}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    textColor="purple"
                    style={styles.buttonText}
                  >
                    {isLoading ? "확인중..." : "확인"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.helpSection}>
          <Text size="sm" weight="normal" style={styles.helpText}>
            학교 이메일이 없는 경우
          </Text>
          <View style={styles.helpRow}>
            <TouchableOpacity onPress={handleIDcardCertification}>
              <Text size="sm" weight="normal" style={styles.linkText}>
                학생증 및 재학증명 제출
              </Text>
            </TouchableOpacity>
            <Text size="sm" weight="normal" style={styles.helpText}>
              을 통해 재학 정보를 인증 받을 수 있어요.
            </Text>
          </View>
          <View style={styles.helpSection}>
            <Text size="sm" weight="normal" style={styles.helpText}>
              재학 인증에 어려움이 있는 경우
            </Text>
            <View style={styles.helpRow}>
              <TouchableOpacity onPress={handleDMClick}>
                <Text size="sm" weight="normal" style={styles.linkText}>
                  DM
                </Text>
              </TouchableOpacity>
              <Text size="sm" weight="normal" style={styles.helpText}>
                으로 문의 주시면 확인 후 도와드립니다.
              </Text>
            </View>
          </View>
        </View>

        {/* 하단 완료 버튼 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.completeButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    marginTop: 32,
  },
  section: {
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: "rgb(249 250 251)",
    borderWidth: 1,
    borderColor: "rgb(192 132 252)",
    borderRadius: 16,
    width: 112,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "rgb(249 250 251)",
    borderWidth: 1,
    borderColor: "rgb(192 132 252)",
    borderRadius: 16,
    paddingHorizontal: 8,
    width: 112,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    textAlign: "center",
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  helpText: {
    color: "rgb(107 114 128)",
  },
  helpRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  linkText: {
    color: "rgb(107 114 128)",
    textDecorationLine: "underline",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  completeButton: {
    width: "100%",
    backgroundColor: "rgb(88 28 135)",
    borderRadius: 16,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
