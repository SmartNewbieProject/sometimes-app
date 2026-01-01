import { ImageCompressionErrorCode } from './types';
import { useTranslation } from 'react-i18next';

export const ERROR_MESSAGES: Record<ImageCompressionErrorCode, string> = {
  [ImageCompressionErrorCode.INVALID_URI]: "이미지를_찾을_수_없습니다",
  [ImageCompressionErrorCode.LOAD_FAILED]: "이미지를_불러올_수_없습니다",
  [ImageCompressionErrorCode.COMPRESSION_FAILED]: "이미지_처리_중_오류가_발생했습니다",
  [ImageCompressionErrorCode.MAX_RETRIES_EXCEEDED]: "이미지_처리에_실패했습니다_다른_사진을_선택해주세요",
  [ImageCompressionErrorCode.FILE_TOO_LARGE]: "이미지_파일이_너무_큽니다",
  [ImageCompressionErrorCode.UNSUPPORTED_FORMAT]: "지원하지_않는_이미지_형식입니다",
};

export function getErrorMessage(code: ImageCompressionErrorCode): string {
  return ERROR_MESSAGES[code] || "이미지_처리_중_오류가_발생했습니다";
}
