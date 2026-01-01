/**
 * JP Identity Verification TanStack Query 설정
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIdentityStatus,
  getIdentityGuide,
  validateIdentityImage,
  submitIdentity,
} from '../apis';
import type {
  JpDocumentType,
  JpIdentityValidateRequest,
  JpIdentitySubmitRequest,
} from '../types';

export const JP_IDENTITY_QUERY_KEYS = {
  status: ['jp-identity', 'status'] as const,
  guide: (documentType: JpDocumentType) =>
    ['jp-identity', 'guide', documentType] as const,
};

/**
 * 본인확인 상태 조회
 * - 앱 포그라운드 복귀 시 refetch
 * - 5분 staleTime으로 불필요한 요청 방지
 */
export const useJpIdentityStatus = () =>
  useQuery({
    queryKey: JP_IDENTITY_QUERY_KEYS.status,
    queryFn: getIdentityStatus,
    staleTime: 1000 * 60 * 5,
  });

/**
 * 촬영 가이드 조회
 */
export const useJpIdentityGuide = (documentType: JpDocumentType | null) =>
  useQuery({
    queryKey: JP_IDENTITY_QUERY_KEYS.guide(documentType!),
    queryFn: () => getIdentityGuide(documentType!),
    enabled: !!documentType,
  });

/**
 * 이미지 검증 뮤테이션
 * - valid=true: 제출 버튼 활성화
 * - valid=false: errors[] 표시, 재촬영 유도
 */
export const useValidateIdentityImage = () => {
  return useMutation({
    mutationFn: (data: JpIdentityValidateRequest) => validateIdentityImage(data),
  });
};

/**
 * 서류 제출 뮤테이션
 * - verified=true: 자동 승인, 채팅 시작 가능
 * - verified=false: 심사 대기
 */
export const useSubmitIdentity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JpIdentitySubmitRequest) => submitIdentity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JP_IDENTITY_QUERY_KEYS.status,
      });
    },
  });
};
