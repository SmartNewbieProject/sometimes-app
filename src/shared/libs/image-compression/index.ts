/**
 * Image Compression 모듈
 * 플랫폼에 따라 자동으로 적절한 구현 선택
 * - iOS/Android: compressor.native.ts
 * - Web: compressor.web.ts
 *
 * Metro bundler가 플랫폼에 따라 .native.ts 또는 .web.ts 자동 선택
 */

export { compressImage, compressImageToBase64, estimateCompressedSize } from './compressor.native';
export * from './types';
export * from './config';
