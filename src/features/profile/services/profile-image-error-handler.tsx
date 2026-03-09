import { PROFILE_KEYS } from '@/src/shared/libs/locales/keys/features/profile.keys';
import type { TFunction } from 'i18next';

export const PROFILE_IMAGE_ERROR_CODES = {
	NO_FACE_DETECTED: 'USER.BAD_REQUEST_NO_FACE_DETECTED',
	MULTIPLE_FACES_DETECTED: 'USER.BAD_REQUEST_MULTIPLE_FACES_DETECTED',
	VISION_UNAVAILABLE: 'USER.SERVICE_UNAVAILABLE_VISION',
} as const;

/** @deprecated Use PROFILE_IMAGE_ERROR_CODES */
export const FACE_VALIDATION_ERROR_CODES = PROFILE_IMAGE_ERROR_CODES;

type ShowModalFn = (options: {
	title: string;
	children: string;
	primaryButton: { text: string; onClick: () => void };
}) => void;

export function handleNoFaceDetected(showModal: ShowModalFn, t: TFunction): void {
	showModal({
		title: t(PROFILE_KEYS.errors.noFaceDetected.title),
		children: t(PROFILE_KEYS.errors.noFaceDetected.message),
		primaryButton: {
			text: t(PROFILE_KEYS.errors.confirm),
			onClick: () => {},
		},
	});
}

export function handleMultipleFacesDetected(showModal: ShowModalFn, t: TFunction): void {
	showModal({
		title: t(PROFILE_KEYS.errors.multipleFacesDetected.title),
		children: t(PROFILE_KEYS.errors.multipleFacesDetected.message),
		primaryButton: {
			text: t(PROFILE_KEYS.errors.confirm),
			onClick: () => {},
		},
	});
}

/**
 * 프로필 이미지 업로드 에러 핸들러
 * - 파일 크기/형식/Vision 장애: 토스트
 * - 얼굴 미감지/다중 감지: 모달
 * 처리된 경우 true, 미처리된 경우 false 반환
 *
 * axios 인터셉터가 에러를 { error, code, status } 형태로 변환하므로
 * error.response.data 경로와 직접 경로를 모두 지원
 */
export function handleProfileImageError(
	// biome-ignore lint/suspicious/noExplicitAny: error type varies
	error: any,
	showModal: ShowModalFn,
	emitToast: (msg: string) => void,
	t: TFunction,
): boolean {
	// axios 인터셉터 변환 후: { error: string, code: string, status: number }
	// 레거시(미변환): error.response.data.error / error.response.data.errorCode
	const errorCode: string | undefined =
		error?.code || error?.response?.data?.code || error?.response?.data?.errorCode || error?.errorCode;
	const errorMessage: string | undefined =
		error?.error || error?.response?.data?.error;

	if (!errorCode && !errorMessage) return false;

	// 파일 크기 초과 (NestJS ParseFilePipe 메시지)
	if (errorMessage?.includes('expected size')) {
		emitToast('파일 크기가 너무 큽니다. 20MB 이하의 사진을 사용해 주세요');
		return true;
	}

	// 지원하지 않는 파일 형식
	if (errorMessage?.includes('expected type')) {
		emitToast('지원하지 않는 형식입니다. JPEG, PNG, WEBP 형식만 가능합니다');
		return true;
	}

	// 얼굴 미감지 (신뢰도 미달 포함)
	if (errorCode === PROFILE_IMAGE_ERROR_CODES.NO_FACE_DETECTED) {
		handleNoFaceDetected(showModal, t);
		return true;
	}

	// 여러 명 얼굴 감지
	if (errorCode === PROFILE_IMAGE_ERROR_CODES.MULTIPLE_FACES_DETECTED) {
		handleMultipleFacesDetected(showModal, t);
		return true;
	}

	// Google Vision 서비스 장애
	if (errorCode === PROFILE_IMAGE_ERROR_CODES.VISION_UNAVAILABLE) {
		emitToast('사진 인식 서비스에 일시적 장애가 발생했습니다. 잠시 후 다시 시도해 주세요');
		return true;
	}

	return false;
}
