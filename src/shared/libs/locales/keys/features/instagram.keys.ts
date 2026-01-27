/**
 * Instagram Feature i18n Keys
 * 인스타그램 인증 기능 관련 번역 키 상수
 */
export const INSTAGRAM_KEYS = {
	// ui.button
	uiButtonContact: 'features.instagram.ui.button.contact',

	// verify
	verifyHeaderTitle: 'features.instagram.verify.header_title',
	verifyTitle: 'features.instagram.verify.title',
	verifyDescription: 'features.instagram.verify.description',
	verifyPlaceholder: 'features.instagram.verify.placeholder',
	verifyPrivacyNote: 'features.instagram.verify.privacy_note',
	verifySubmitButton: 'features.instagram.verify.submit_button',
	verifySuccessTitle: 'features.instagram.verify.success_title',
	verifySuccessMessage: 'features.instagram.verify.success_message',
	verifySuccessRewardedTitle: 'features.instagram.verify.success_rewarded_title',
	verifySuccessRewardedMessage: 'features.instagram.verify.success_rewarded_message',
	verifyErrorMessage: 'features.instagram.verify.error_message',

	// services
	servicesAlertTitle: 'features.instagram.services.alert_title',
	servicesNoInstagramId: 'features.instagram.services.no_instagram_id',
	servicesErrorTitle: 'features.instagram.services.error_title',
	servicesConnectionError: 'features.instagram.services.connection_error',
	servicesConfirm: 'features.instagram.services.confirm',
} as const;

export type InstagramKey = (typeof INSTAGRAM_KEYS)[keyof typeof INSTAGRAM_KEYS];
