import { ImageCompressionErrorCode } from './types';

export const ERROR_MESSAGES: Record<ImageCompressionErrorCode, string> = {
  [ImageCompressionErrorCode.INVALID_URI]: '이미지를 찾을 수 없습니다.',
  [ImageCompressionErrorCode.LOAD_FAILED]: '이미지를 불러올 수 없습니다.',
  [ImageCompressionErrorCode.COMPRESSION_FAILED]: '이미지 처리 중 오류가 발생했습니다.',
  [ImageCompressionErrorCode.MAX_RETRIES_EXCEEDED]: '이미지 처리에 실패했습니다. 다른 사진을 선택해주세요.',
  [ImageCompressionErrorCode.FILE_TOO_LARGE]: '이미지 파일이 너무 큽니다.',
  [ImageCompressionErrorCode.UNSUPPORTED_FORMAT]: '지원하지 않는 이미지 형식입니다.',
};

export function getErrorMessage(code: ImageCompressionErrorCode): string {
  return ERROR_MESSAGES[code] || '이미지 처리 중 오류가 발생했습니다.';
}
