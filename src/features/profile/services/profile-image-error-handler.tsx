import { PROFILE_KEYS } from '@/src/shared/libs/locales/keys/features/profile.keys';
import type { TFunction } from 'i18next';

/**
 * 얼굴 검증 관련 에러 코드
 */
export const FACE_VALIDATION_ERROR_CODES = {
	NO_FACE_DETECTED: 'USER.BAD_REQUEST_NO_FACE_DETECTED',
	MULTIPLE_FACES_DETECTED: 'USER.BAD_REQUEST_MULTIPLE_FACES_DETECTED',
} as const;

type ShowModalFn = (options: {
	title: string;
	children: string;
	primaryButton: { text: string; onClick: () => void };
}) => void;

/**
 * 얼굴 미인식 에러 모달 표시
 */
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

/**
 * 다중 얼굴 감지 에러 모달 표시
 */
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
 * 얼굴 검증 에러인 경우 모달을 표시하고 true 반환
 * 다른 에러인 경우 false 반환하여 기존 에러 처리 로직으로 넘김
 */
export function handleProfileImageError(
	// biome-ignore lint/suspicious/noExplicitAny: error type varies
	error: any,
	showModal: ShowModalFn,
	t: TFunction,
): boolean {
	const errorCode = error?.response?.data?.errorCode || error?.errorCode;

	if (errorCode === FACE_VALIDATION_ERROR_CODES.NO_FACE_DETECTED) {
		handleNoFaceDetected(showModal, t);
		return true;
	}

	if (errorCode === FACE_VALIDATION_ERROR_CODES.MULTIPLE_FACES_DETECTED) {
		handleMultipleFacesDetected(showModal, t);
		return true;
	}

	return false;
}
