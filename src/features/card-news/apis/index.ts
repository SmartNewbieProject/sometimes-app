/**
 * 카드뉴스 API 클라이언트
 * axiosClient interceptor가 response.data.data 자동 추출
 */
import axiosClient from "@/src/shared/libs/axios";
import type {
  CardNewsHighlight,
  CardNewsListResponse,
  CardNewsDetail,
  CardNewsRewardResponse,
  GetCardNewsListParams,
} from "../types";

const BASE_PATH = "/posts/card-news";

/**
 * 하이라이트 카드뉴스 조회
 * 최근 7일 이내 발행된 카드뉴스 중 최신 3개 반환
 */
export const getCardNewsHighlights = (): Promise<CardNewsHighlight[]> => {
  return axiosClient.get(`${BASE_PATH}/highlights`);
};

/**
 * 카드뉴스 목록 조회 (Cursor 기반 페이지네이션)
 * @param params.cursor - 다음 페이지 조회용 커서
 * @param params.limit - 페이지당 조회 개수 (기본: 10, 최대: 50)
 */
export const getCardNewsList = (
  params?: GetCardNewsListParams
): Promise<CardNewsListResponse> => {
  return axiosClient.get(BASE_PATH, {
    params: {
      cursor: params?.cursor,
      limit: params?.limit ?? 10,
    },
  });
};

/**
 * 카드뉴스 상세 조회
 * 조회 시 서버에서 조회수(readCount) 자동 증가
 */
export const getCardNewsDetail = (id: string): Promise<CardNewsDetail> => {
  return axiosClient.get(`${BASE_PATH}/${id}`);
};

/**
 * 카드뉴스 보상 요청
 * 마지막 카드 도달 시 구슬 보상 요청
 * - hasReward=true인 카드뉴스에서만 보상 가능
 * - 사용자당 카드뉴스별 1회만 지급
 */
export const requestCardNewsReward = (
  id: string
): Promise<CardNewsRewardResponse> => {
  return axiosClient.post(`${BASE_PATH}/${id}/reward`);
};
