import type { ImageCompressionConfig } from './types';

export const DEFAULT_IMAGE_COMPRESSION_CONFIG: ImageCompressionConfig = {
  maxDimension: 2048,
  quality: 0.9,
  outputFormat: 'jpeg',
  maxFileSizeBytes: 20 * 1024 * 1024,
  maxRetries: 3,
};

export const PROFILE_IMAGE_CONFIG: Partial<ImageCompressionConfig> = {
  maxDimension: 2048,
  quality: 0.9,
  outputFormat: 'jpeg',
};

export const CHAT_IMAGE_CONFIG: Partial<ImageCompressionConfig> = {
  maxDimension: 1920,
  quality: 0.85,
  outputFormat: 'jpeg',
};

export const ARTICLE_IMAGE_CONFIG: Partial<ImageCompressionConfig> = {
  maxDimension: 1920,
  quality: 0.85,
  outputFormat: 'jpeg',
};

export const TARGET_FILE_SIZE = {
  PROFILE: 1.5 * 1024 * 1024,
  CHAT: 1 * 1024 * 1024,
  ARTICLE: 2 * 1024 * 1024,
};

export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;

export const RETRY_DELAYS_MS = [1000, 2000, 4000];
