/**
 * 카드뉴스 Feature 배럴 export
 * FSD 아키텍처 - Feature Layer
 */

// Types
export type {
  CardNewsHighlight,
  CardNewsListItem,
  CardNewsDetail,
  CardSection,
  CardNewsRewardResponse,
  CardNewsListResponse,
  BackgroundImage,
} from "./types";

// APIs
export {
  getCardNewsHighlights,
  getCardNewsList,
  getCardNewsDetail,
  requestCardNewsReward,
} from "./apis";

// Queries
export {
  useCardNewsHighlights,
  useCardNewsInfiniteList,
  useCardNewsDetail,
  useCardNewsReward,
  CARD_NEWS_QUERY_KEYS,
} from "./queries";

// UI Components
export {
  CardNewsHighlights,
  CardNewsList,
  CardNewsViewer,
  CardNewsHome,
} from "./ui";

// Hooks
export { useCardNewsAnalytics } from "./hooks";

// Constants
export {
  CARD_NEWS_EVENTS,
  CARD_NEWS_ENTRY_SOURCES,
  CARD_NEWS_NAVIGATION_METHODS,
  CARD_NEWS_EXIT_METHODS,
} from "./constants";
