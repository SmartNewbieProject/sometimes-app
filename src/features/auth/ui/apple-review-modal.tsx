import {useState} from "react";
import {View, Modal, Alert} from "react-native";
import {Text, Button, TextArea} from "@/src/shared/ui";
import {useAppleReviewLogin} from "../hooks/use-apple-review-login";
import {useAuth} from "../hooks/use-auth";
import {router} from "expo-router";

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
        <View className="flex-1 justify-center items-center bg-surface-inverse/50">
          <View className="bg-surface-background rounded-lg p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-center mb-4">
              Apple 심사용 로그인
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-6">
              애플 심사용 코드를 입력해주세요
            </Text>

            <TextArea
                value={code}
                onChangeText={setCode}
                placeholder="코드를 입력하세요"
                className="mb-4"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <View className="flex-row gap-2">
              <Button
                  variant="outline"
                  onPress={handleClose}
                  className="flex-1"
                  disabled={isPending}
              >
                취소
              </Button>
              <Button
                  onPress={handleSubmit}
                  className="flex-1"
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