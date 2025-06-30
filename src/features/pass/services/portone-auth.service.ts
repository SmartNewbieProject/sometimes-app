import { platform } from "@shared/libs/platform";
import {
  PortOneIdentityVerificationRequest,
  PortOneIdentityVerificationResponse,
} from '../types';

/**
 * PortOne V2 본인인증 서비스
 * 플랫폼별로 다른 인증 방식을 제공합니다.
 */
export class PortOneAuthService {
  private readonly storeId: string;
  private readonly channelKey: string;
  private readonly merchantId: string;
  private readonly impUid: string;
  private readonly pgProvider: string;
  private readonly passChannelKey: string;

  constructor() {
    // 환경변수에서 직접 초기화
    this.storeId = process.env.EXPO_PUBLIC_STORE_ID as string;
    this.channelKey = process.env.EXPO_PUBLIC_CHANNEL_KEY as string;
    this.merchantId = process.env.EXPO_PUBLIC_MERCHANT_ID as string;
    this.impUid = process.env.EXPO_PUBLIC_IMP as string;
    this.pgProvider = process.env.EXPO_PUBLIC_PG_PROVIDER as string;
    this.passChannelKey = process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string;

    if (!this.storeId) {
      throw new Error('EXPO_PUBLIC_STORE_ID 환경변수가 설정되지 않았습니다.');
    }
    if (!this.passChannelKey) {
      throw new Error('EXPO_PUBLIC_PASS_CHANNEL_KEY 환경변수가 설정되지 않았습니다.');
    }
  }

  async requestIdentityVerification(
    options: Partial<PortOneIdentityVerificationRequest> = {}
  ): Promise<PortOneIdentityVerificationResponse> {
    return platform({
      web: () => this.requestWebAuth(options),
      default: () => this.requestMobileAuth(options),
    });
  }

  // 웹 환경에서 PortOne V2 SDK를 사용한 본인인증
  private async requestWebAuth(
    options: Partial<PortOneIdentityVerificationRequest>
  ): Promise<PortOneIdentityVerificationResponse> {
    try {
      const PortOne = await import("@portone/browser-sdk/v2");

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

  private async requestMobileAuth(
    options: Partial<PortOneIdentityVerificationRequest>
  ): Promise<PortOneIdentityVerificationResponse> {
    // TODO: 모바일 환경에서의 본인인증 구현
    throw new Error('모바일 PASS 인증은 추후 구현 예정입니다.');
  }
}
