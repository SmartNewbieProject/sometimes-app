import {useState} from "react";
import {View, Modal, Alert, StyleSheet} from "react-native";
import { Text } from "@/src/shared/ui/text";
import { Button } from "@/src/shared/ui/button";
import { TextArea } from "@/src/shared/ui/text-area";
import {useAppleReviewLogin} from "../hooks/use-apple-review-login";
import {useAuth} from "../hooks/use-auth";
import {router} from "expo-router";
import { semanticColors } from "@/src/shared/constants/colors";

interface AppleReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AppleReviewModal({isVisible, onClose}: AppleReviewModalProps) {
  const [code, setCode] = useState("");
  const {mutate: appleReviewLogin, isPending} = useAppleReviewLogin();
  const {updateToken} = useAuth();

  const handleSubmit = () => {
    if (code.trim() === "AppleConnect") {
      appleReviewLogin(
          {appleId: "AppleConnect"},
          {
            onSuccess: async (data) => {
              if (data.accessToken && data.refreshToken) {
                await updateToken(data.accessToken, data.refreshToken);
                Alert.alert("성공", "Apple 심사용 로그인이 완료되었습니다.", [
                  {
                    text: "확인",
                    onPress: () => {
                      onClose();
                      setCode("");
                      router.push("/home");
                    },
                  },
                ]);
              } else {
                Alert.alert("오류", "토큰 정보가 올바르지 않습니다.");
              }
            },
            onError: (error) => {
              Alert.alert("오류", "로그인에 실패했습니다. 다시 시도해주세요.");
              console.error("Apple review login error:", error);
            },
          }
      );
    } else {
      Alert.alert("오류", "올바른 코드를 입력해주세요.");
    }
  };

  const handleClose = () => {
    setCode("");
    onClose();
  };

  return (
      <Modal
          visible={isVisible}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titleText}>
              Apple 심사용 로그인
            </Text>

            <Text style={styles.descriptionText}>
              애플 심사용 코드를 입력해주세요
            </Text>

            <TextArea
                value={code}
                onChangeText={setCode}
                placeholder="코드를 입력하세요"
                style={styles.textArea}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <View style={styles.buttonContainer}>
              <Button
                  variant="outline"
                  onPress={handleClose}
                  style={styles.button}
                  disabled={isPending}
              >
                취소
              </Button>
              <Button
                  onPress={handleSubmit}
                  style={styles.button}
                  disabled={isPending || !code.trim()}
              >
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 8,
    padding: 24,
    marginHorizontal: 16,
    width: '100%',
    maxWidth: 384,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: semanticColors.text.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: semanticColors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  textArea: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});