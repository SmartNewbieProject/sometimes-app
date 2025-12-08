export interface ImageCompressionConfig {
  maxDimension: number;
  quality: number;
  outputFormat: 'jpeg' | 'png';
  maxFileSizeBytes: number;
  maxRetries: number;
}

export interface ImageCompressionOptions {
  maxDimension?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'png';
  onProgress?: (progress: number) => void;
}

export interface ImageCompressionResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  sizeInBytes: number;
  mimeType: string;
}

export interface ImageCompressionMetrics {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTimeMs: number;
  resized: boolean;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
}

export enum ImageCompressionErrorCode {
  INVALID_URI = 'INVALID_URI',
  LOAD_FAILED = 'LOAD_FAILED',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

export class ImageCompressionError extends Error {
  constructor(
    public code: ImageCompressionErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ImageCompressionError';
  }
}
