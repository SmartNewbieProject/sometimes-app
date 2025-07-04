import { useStorage } from "./use-storage";
import { match } from 'ts-pattern';
import { Platform } from "react-native";

enum ATTRequestStatus {
  ALLOWED = 'allowed',
  DENIED = 'denied',
}

export const useAtt = () => {
  const { value: allowRequestAtt, setValue: setAllowRequestAtt } = useStorage({
    key: 'ios-att-allow-request-att',
    initialValue: ATTRequestStatus.ALLOWED,
  });

  const request = async () => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      // 네이티브 환경에서만 expo-tracking-transparency 사용
      const ExpoTrackingTransparency = require('expo-tracking-transparency');
      const { requestTrackingPermissionsAsync, PermissionStatus } = ExpoTrackingTransparency;

      if (allowRequestAtt === ATTRequestStatus.ALLOWED) {
        const { status } = await requestTrackingPermissionsAsync();
        match(status)
          .with(PermissionStatus.DENIED, () => {
            setAllowRequestAtt(ATTRequestStatus.DENIED);
          })
          .otherwise(() => {
            setAllowRequestAtt(ATTRequestStatus.ALLOWED);
          });
      }
    } catch (error) {
      // 모듈 로드 실패 시 무시 (웹 환경에서는 정상적인 상황)
      console.warn('expo-tracking-transparency module not available:', error);
    }
  };

  return {
    request,
    allowRequestAtt,
  }
};
