/**
 * JP Identity Verification API
 *
 * Base URL: /jp/identity
 * Auth: Bearer Token required
 * Target: country=JP 유저만
 */

import axiosClient from '@/src/shared/libs/axios';
import type {
  JpIdentityStatusResponse,
  JpIdentityGuideResponse,
  JpIdentityValidateRequest,
  JpIdentityValidateResponse,
  JpIdentitySubmitRequest,
  JpIdentitySubmitResponse,
  JpDocumentType,
} from '../types';

/**
 * 본인확인 상태 조회
 * GET /jp/identity/status
 */
export const getIdentityStatus = (): Promise<JpIdentityStatusResponse> =>
  axiosClient.get('/jp/identity/status');

/**
 * 촬영 가이드 조회
 * GET /jp/identity/guide/:documentType
 */
export const getIdentityGuide = (
  documentType: JpDocumentType
): Promise<JpIdentityGuideResponse> =>
  axiosClient.get(`/jp/identity/guide/${documentType}`);

/**
 * 실시간 이미지 검증
 * POST /jp/identity/validate-image
 *
 * @description 촬영 완료 시 이미지 품질 및 OCR 결과 검증
 * - valid=true: 제출 버튼 활성화
 * - valid=false: errors 표시, 재촬영 유도
 */
export const validateIdentityImage = (
  data: JpIdentityValidateRequest
): Promise<JpIdentityValidateResponse> =>
  axiosClient.post('/jp/identity/validate-image', data);

/**
 * 본인확인 서류 제출
 * POST /jp/identity/submit
 *
 * @description 서류 제출 후 심사 큐 등록
 * - verified=true: 자동 승인 완료, 채팅 시작 가능
 * - verified=false: 심사 대기, 푸시 알림 대기
 */
export const submitIdentity = (
  data: JpIdentitySubmitRequest
): Promise<JpIdentitySubmitResponse> =>
  axiosClient.post('/jp/identity/submit', data);
