import { axiosClient } from "@shared/libs";
import type { PassLoginResponse } from "@/src/auth/dto/pass-login.dto";
import type { VerifyIdentityResponse } from "@/src/auth/dto/pass-login.dto";

/**
 * PortOne 로그인 서비스
 * 본인인증 결과를 서버로 전송하여 로그인을 처리합니다.
 */
export class PortOneLoginService {

  async loginWithIdentityVerification(identityVerificationId: string): Promise<PassLoginResponse> {
    try {
      const response = await axiosClient.post('/auth/pass-login', { 
        impUid: identityVerificationId 
      });
      return response as unknown as PassLoginResponse;
    } catch (error) {
      console.error('PASS 로그인 API 호출 실패:', error);
      throw error;
    }
  }

  async verifyIdentityVerification(identityVerificationId: string): Promise<boolean> {
    try {
      const response: VerifyIdentityResponse = await axiosClient.post('/auth/verify-identity', {
        identityVerificationId
      });
      return response.verified === true;
    } catch (error) {
      console.error('본인인증 검증 실패:', error);
      return false;
    }
  }
}
