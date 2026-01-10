/**
 * i18n Keys - 타입세이프 번역 키 상수
 *
 * 사용법:
 * ```typescript
 * import { PAYMENT_KEYS } from '@/src/shared/libs/locales/keys';
 *
 * const { t } = useTranslation();
 * t(PAYMENT_KEYS.uiAppleFirstSaleCardCheerMessage)
 * ```
 *
 * 새 키 추가 시:
 * 1. 해당 카테고리의 *.keys.ts 파일에 상수 추가
 * 2. 카테고리 index.ts에서 export 확인
 */

// Global Keys
export * from './global.keys';

// Feature Keys
export * from './features';

// App Keys
export * from './apps';

// Widget Keys
export * from './widgets';

// Shared Keys
export * from './shareds';

// Type exports
export type { GlobalKey } from './global.keys';
export type { PaymentKey } from './features/payment.keys';
export type { LikeLetterKey } from './features/like-letter.keys';
export type { EventKey } from './features/event.keys';
export type { InstagramKey } from './features/instagram.keys';
