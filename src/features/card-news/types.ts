/**
 * 카드뉴스 API 타입 정의
 * API 스펙 기반 TypeScript 인터페이스
 */

// 배경 이미지 정보
export interface BackgroundImage {
  url: string;
  presetName?: string;
}

// 카드 섹션 (개별 슬라이드)
export interface CardSection {
  order: number;
  title: string;
  content: string; // HTML 형식
  imageUrl?: string;
}

// 하이라이트 카드뉴스 (GET /posts/card-news/highlights)
export interface CardNewsHighlight {
  id: string;
  title: string;
  description: string;
  backgroundImage: BackgroundImage;
  hasReward: boolean;
  publishedAt: string; // ISO8601
}

// 목록 아이템 (GET /posts/card-news)
export interface CardNewsListItem {
  id: string;
  title: string;
  description: string;
  backgroundImage: BackgroundImage;
  hasReward: boolean;
  publishedAt: string; // ISO8601
  readCount: number;
}

// 목록 응답 (Cursor 기반 페이지네이션)
export interface CardNewsListResponse {
  data: CardNewsListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

// 상세 정보 (GET /posts/card-news/:id)
export interface CardNewsDetail {
  id: string;
  title: string;
  description: string;
  backgroundImage: BackgroundImage;
  hasReward: boolean;
  sections: CardSection[];
  readCount: number;
  publishedAt: string; // ISO8601
  createdAt: string; // ISO8601
}

// 보상 응답 (POST /posts/card-news/:id/reward)
export interface CardNewsRewardResponse {
  success: boolean;
  alreadyRewarded: boolean;
  reward?: {
    gems: number;
    currentBalance: number;
  };
  message: string;
}

// 목록 조회 파라미터
export interface GetCardNewsListParams {
  cursor?: string;
  limit?: number; // default: 10, max: 50
}
