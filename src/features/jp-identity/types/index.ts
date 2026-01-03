/**
 * JP Identity Verification (日本 本人確認) 타입 정의
 *
 * API 엔드포인트:
 * - GET  /jp/identity/status              - 현재 상태 확인
 * - GET  /jp/identity/guide/:documentType - 촬영 가이드 조회
 * - POST /jp/identity/validate-image      - 실시간 이미지 검증
 * - POST /jp/identity/submit              - 문서 제출
 */

export type JpIdentityStatus =
  | null
  | 'PENDING'
  | 'AUTO_APPROVED'
  | 'MANUAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type JpDocumentType = 'HEALTH_INSURANCE' | 'DRIVERS_LICENSE';

/**
 * GET /jp/identity/status 응답
 */
export interface JpIdentityStatusResponse {
  verified: boolean;
  status: JpIdentityStatus;
  documentType: JpDocumentType | null;
  submittedAt: string | null;
  rejectionReason: string | null;
}

/**
 * GET /jp/identity/guide/:documentType 응답
 */
export interface JpIdentityGuideResponse {
  title: string;
  description: string;
  tips: string[];
  prohibitedInfo: string[];
}

/**
 * POST /jp/identity/validate-image 요청
 */
export interface JpIdentityValidateRequest {
  documentType: JpDocumentType;
  imageBase64: string;
}

/**
 * POST /jp/identity/validate-image 응답
 */
export interface JpIdentityValidateResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * POST /jp/identity/submit 요청
 */
export interface JpIdentitySubmitRequest {
  documentType: JpDocumentType;
  imageBase64: string;
}

/**
 * POST /jp/identity/submit 응답
 */
export interface JpIdentitySubmitResponse {
  verified: boolean;
  message: string;
}

/**
 * 프론트엔드 플로우 단계
 */
export type JpIdentityStep =
  | 'SELECT_DOCUMENT'
  | 'CAPTURE'
  | 'VALIDATE'
  | 'CONFIRM'
  | 'PENDING'
  | 'REJECTED'
  | 'APPROVED';

/**
 * 채팅 403 에러 메시지
 */
export const JP_IDENTITY_REQUIRED_MESSAGE = '本人確認が必要です';
