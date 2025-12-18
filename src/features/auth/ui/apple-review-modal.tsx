import {useState} from "react";
import {View, Modal, Alert, StyleSheet} from "react-native";
import {Text, Button, TextArea} from "@/src/shared/ui";
import {useAppleReviewLogin} from "../hooks/use-apple-review-login";
import {useAuth} from "../hooks/use-auth";
import {router} from "expo-router";
import { useTranslation } from "react-i18next";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

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
            },
          }
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
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title} textColor="black">
              {t("features.auth.ui.apple_review_modal.modal_title")}
            </Text>

            <Text style={styles.description} textColor="gray">
              {t("features.auth.ui.apple_review_modal.modal_prompt")}
            </Text>

            <TextArea
                value={code}
                onChangeText={setCode}
                placeholder={t("features.auth.ui.apple_review_modal.code_placeholder")}
                style={styles.textArea}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <Button
                  variant="outline"
                  onPress={handleClose}
                  styles={styles.button}
                  disabled={isPending}
              >
                {t("features.auth.ui.apple_review_modal.cancel_button")}
              </Button>
              <Button
                  onPress={handleSubmit}
                  styles={styles.button}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 8,
    padding: 24,
    marginHorizontal: 16,
    width: "100%",
    maxWidth: 384,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  textArea: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
