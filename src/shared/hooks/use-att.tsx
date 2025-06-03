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

    const { requestTrackingPermissionsAsync, PermissionStatus } = await import('expo-tracking-transparency');

    if (allowRequestAtt === ATTRequestStatus.ALLOWED) {
      const { status } = await requestTrackingPermissionsAsync();
      match(status)
        .with(PermissionStatus.GRANTED, () => {
          setAllowRequestAtt(ATTRequestStatus.ALLOWED);
        })
        .with(PermissionStatus.DENIED, () => {
          setAllowRequestAtt(ATTRequestStatus.DENIED);
        })
        .otherwise(() => {
          setAllowRequestAtt(ATTRequestStatus.ALLOWED);
        });
    }
  };

  return {
    request,
    allowRequestAtt,
  }
};
