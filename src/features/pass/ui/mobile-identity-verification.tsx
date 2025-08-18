import {
  IdentityVerification,
  type PortOneController,
} from "@portone/react-native-sdk";
import { useRef } from "react";
import { Modal, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  PortOneIdentityVerificationRequest,
  PortOneIdentityVerificationResponse,
} from "../types";

interface MobileIdentityVerificationProps {
  request: PortOneIdentityVerificationRequest;
  onComplete?: (response: PortOneIdentityVerificationResponse) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

/**
 * 모바일에서 PortOne React Native SDK를 사용한 본인인증 컴포넌트
 */
export const MobileIdentityVerification: React.FC<
  MobileIdentityVerificationProps
> = ({ request, onComplete, onError }) => {
  const controllerRef = useRef<PortOneController>(null);
  const insets = useSafeAreaInsets();
  const handleComplete = (response: unknown) => {
    if (!response) {
      onError?.(new Error("본인인증 응답이 없습니다."));
      return;
    }

    const responseObj = response as Record<string, unknown>;

    if (responseObj.code != null) {
      const errorMessage =
        String(responseObj.message) || "본인인증에 실패했습니다.";
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

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        // 안드로이드 뒤로가기 버튼 처리
        onError?.(new Error("사용자가 인증을 취소했습니다."));
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View
        style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}
      >
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
