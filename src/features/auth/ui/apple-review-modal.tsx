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
  const { t } = useTranslation();
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
                Alert.alert(t("features.auth.ui.apple_review_modal.alert_success_title"), t("features.auth.ui.apple_review_modal.alert_success_message"), [
                  {
                                      {
                    text: t("features.auth.ui.apple_review_modal.alert_confirm_button"),
                    onPress: () => {
                      onClose();
                      setCode("");
                      router.push("/home");
                    },
                  },
                ]);
              } else {
                Alert.alert(t("features.auth.ui.apple_review_modal.alert_error_title"), t("features.auth.ui.apple_review_modal.alert_error_token"));
              }
            },
            onError: (error) => {
              Alert.alert(t("features.auth.ui.apple_review_modal.alert_error_title"), t("features.auth.ui.apple_review_modal.alert_error_login_failed"));
      );
    } else {
      Alert.alert(t("features.auth.ui.apple_review_modal.alert_error_title"), t("features.auth.ui.apple_review_modal.alert_error_invalid_code"));
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 mx-4 w-full max-w-sm">
            <Text className="text-lg font-semibold text-center mb-4">
              {t("features.auth.ui.apple_review_modal.modal_title")}
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-6">
              {t("features.auth.ui.apple_review_modal.modal_prompt")}
            </Text>

            <TextArea
                value={code}
                onChangeText={setCode}
                placeholder={t("features.auth.ui.apple_review_modal.code_placeholder")}
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
                              >
                {t("features.auth.ui.apple_review_modal.cancel_button")}
              </Button>
              <Button
                  onPress={handleSubmit}
                  className="flex-1"
                  disabled={isPending || !code.trim()}
              >
                {isPending ? t("features.auth.ui.apple_review_modal.login_button_loading") : t("features.auth.ui.apple_review_modal.login_button")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
  );
}