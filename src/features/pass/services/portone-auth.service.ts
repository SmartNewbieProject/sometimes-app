import type {
  PortOneIdentityVerificationRequest,
  PortOneIdentityVerificationResponse,
} from '../types';
import { Platform } from 'react-native';

/**
 * PortOne V2 본인인증 서비스
 * 플랫폼별로 다른 인증 방식을 제공합니다.
 */
export class PortOneAuthService {
  private readonly storeId: string;
  private readonly passChannelKey: string;

  constructor() {
    this.storeId = process.env.EXPO_PUBLIC_STORE_ID as string;
    this.passChannelKey = process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string;

    this.validateEnvironmentVariables();
  }

  private async loadPortOneSDK() {
    if (Platform.OS !== 'web') {
      throw new Error('웹 환경에서만 사용 가능합니다.');
    }

    try {
      const module = await import("@portone/browser-sdk/v2");
      return module;
    } catch (error) {
      throw new Error('PortOne SDK 로드에 실패했습니다.');
    }
  }

  private validateEnvironmentVariables() {
    const requiredEnvVars = [
      { key: 'EXPO_PUBLIC_STORE_ID', value: this.storeId },
      { key: 'EXPO_PUBLIC_PASS_CHANNEL_KEY', value: this.passChannelKey },
    ];

    for (const { key, value } of requiredEnvVars) {
      if (!value) {
        throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
      }
    }
  }

  async requestIdentityVerification(
    options: Partial<PortOneIdentityVerificationRequest> = {}
  ): Promise<PortOneIdentityVerificationResponse> {
    // 웹에서만 사용됨 (모바일은 MobileIdentityVerification 컴포넌트에서 처리)
    return this.requestWebAuth(options);
  }

  // 웹 환경에서 PortOne V2 SDK를 사용한 본인인증
  private async requestWebAuth(
    options: Partial<PortOneIdentityVerificationRequest>
  ): Promise<PortOneIdentityVerificationResponse> {
    try {
      if (typeof window === 'undefined' || Platform.OS !== 'web') {
        throw new Error('웹 환경에서만 사용 가능합니다.');
      }
      const PortOne = await this.loadPortOneSDK();

      const request: PortOneIdentityVerificationRequest = {
        storeId: this.storeId,
        channelKey: this.passChannelKey, // PASS 인증용 채널키 사용
        identityVerificationId: `cert_${new Date().getTime()}`,
        windowType: {
          pc: "POPUP",
          mobile: "REDIRECTION"
        },
        ...options,
      };

      const response = await PortOne.requestIdentityVerification(request);

      if (!response) {
        throw new Error('본인인증 응답이 없습니다.');
      }

      if (response.code != null) {
        throw new Error(response.message || '본인인증에 실패했습니다.');
      }

      return {
        identityVerificationId: response.identityVerificationId,
        code: response.code,
        message: response.message,
      };
    } catch (error) {
      console.error('PortOne V2 SDK 오류:', error);
      throw error;
    }
  }


}
