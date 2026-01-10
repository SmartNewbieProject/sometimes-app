/**
 * Global i18n Keys
 * 전역적으로 사용되는 번역 키 상수
 */
export const GLOBAL_KEYS = {
	// Top-level keys
	loading: 'loading',
	cancel: 'cancel',
	confirm: 'confirm',
	close: 'close',
	error: 'error',
	success: 'success',
	select: 'select',
	next: 'next',
	back: 'back',
	ok: 'ok',
	no: 'no',
	confirmButton: 'confirm_button',
	confirmChecked: 'confirm_checked',

	// not_found
	notFoundTitle: 'not_found.title',
	notFoundDescription: 'not_found.description',
	notFoundGoHome: 'not_found.go_home',

	// slide_unlock
	slideUnlockDefaultText: 'slide_unlock.default_text',

	// common
	commonSettingsOpen: 'common.설정_열기',
	commonClose: 'common.닫기',
	commonImageOptimizing: 'common.이미지를_최적화하고_있어요',
	commonImageCompressionFailed: 'common.이미지_압축_실패_원본_사용',
	commonSearch: 'common.검색',
	commonNoResults: 'common.결과가_없습니다',
	commonOther: 'common.기타',
	commonOtherReasonPlaceholder: 'common.기타_이유를_입력해주세요',
	commonNoData: 'common.no_data',
	commonProcessing: 'common.processing',
	commonCancel: 'common.cancel',
	commonLoading: 'common.loading',
	commonImageLoading: 'common.image_loading',
	commonImageLoadFailed: 'common.image_load_failed',
	commonImageOptimizingShort: 'common.image_optimizing',
	commonBusinessInfoCheck: 'common.business_info_check',
	commonInstallAppTooltip: 'common.install_app_tooltip',
	commonDownloadAppStore: 'common.download_app_store',
	commonDownloadGooglePlay: 'common.download_google_play',
	commonRejectionReason: 'common.거절_사유',
	commonConfirm: 'common.확인',
	commonInvalidRequest: 'common.잘못된_요청입니다',
	commonNotice: 'common.알림',
	commonAuthError: 'common.인증_오류',
	commonGoToLogin: 'common.로그인_페이지로',
	commonServerError: 'common.서버에_문제가_발생했습니다_관리자에게_문의_바랍니다',
	commonReasonNotProvided: 'common.사유_미기재',
	commonErrorOccurred: 'common.오류가_발생했어요',
	commonGuide: 'common.안내',
	commonPostDeleteFailed: 'common.게시글_삭제에_실패했습니다_잠시_후_다시_시도해주세요',
	commonSearchUniversity: 'common.대학교_이름을_검색해주세요',
	commonNetworkError: 'common.네트워크_연결을_확인해주세요',
	commonSuccess: 'common.성공',
	commonError: 'common.오류',
} as const;

export type GlobalKey = (typeof GLOBAL_KEYS)[keyof typeof GLOBAL_KEYS];
