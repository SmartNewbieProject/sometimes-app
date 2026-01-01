import { semanticColors } from '@/src/shared/constants/semantic-colors';
import {
  IdentityVerification,
  type PortOneController,
} from "@portone/react-native-sdk";
import { useRef } from "react";
import {
  Modal,
  StatusBar,
  View,
  TouchableOpacity,
  Text as RNText,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import type {
  PortOneIdentityVerificationRequest,
  PortOneIdentityVerificationResponse,
} from "../types";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

interface MobileIdentityVerificationProps {
  request: PortOneIdentityVerificationRequest;
  onComplete?: (response: PortOneIdentityVerificationResponse) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

/**
 * 모바일에서 PortOne React Native SDK를 사용한 본인인증 컴포넌트
 * 커스텀 Modal을 렌더링하며, 뒤로가기 기능을 포함합니다.
 */
export const MobileIdentityVerification: React.FC<
  MobileIdentityVerificationProps
> = ({ request, onComplete, onError, onCancel }) => {
  const controllerRef = useRef<PortOneController>(null);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const handleComplete = (response: unknown) => {
    if (!response) {
      onError?.(new Error(t("features.pass.mobile-identity-verification.no_response")));
      return;
    }

    const responseObj = response as Record<string, unknown>;

    if (responseObj.code != null) {
      const errorMessage =
        String(responseObj.message) || t("features.pass.mobile-identity-verification.verification_failed");
      onError?.(new Error(errorMessage));
      return;
    }

    if (!responseObj.identityVerificationId) {
      onError?.(new Error("본인인증 ID를 받지 못했습니다."));
      return;
    }

    onComplete?.({
      identityVerificationId: String(responseObj.identityVerificationId),
      code: responseObj.code ? String(responseObj.code) : undefined,
      message: responseObj.message ? String(responseObj.message) : undefined,
    });
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onError?.(new Error(errorMessage));
  };

  const handleModalClose = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleModalClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View
        style={{ flex: 1, backgroundColor: semanticColors.surface.background, paddingTop: insets.top }}
      >
        <View style={modalStyles.header}>
          <TouchableOpacity
            onPress={() => {
              onCancel?.();
              router.back();
            }}
            style={modalStyles.backButton}
          >
            <Feather name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <RNText style={modalStyles.headerTitle}>{t("features.pass.mobile-identity-verification.title")}</RNText>
          <View style={modalStyles.rightPlaceholder} />
        </View>

        <IdentityVerification
          ref={controllerRef}
          request={request}
          onComplete={handleComplete}
          onError={handleError}
        />
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: semanticColors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E9EC",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  rightPlaceholder: {
    width: 24 + 16,
  },
});
