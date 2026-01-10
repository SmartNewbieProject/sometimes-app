/**
 * Like Letter Feature i18n Keys
 * 편지 좋아요 기능 관련 번역 키 상수
 */
export const LIKE_LETTER_KEYS = {
	// ui.option_modal
	uiOptionModalTitleLine1: 'features.like-letter.ui.option_modal.title_line1',
	uiOptionModalTitleLine2: 'features.like-letter.ui.option_modal.title_line2',
	uiOptionModalDescriptionLine1: 'features.like-letter.ui.option_modal.description_line1',
	uiOptionModalDescriptionLine2: 'features.like-letter.ui.option_modal.description_line2',
	uiOptionModalSimpleLike: 'features.like-letter.ui.option_modal.simple_like',
	uiOptionModalLetterLike: 'features.like-letter.ui.option_modal.letter_like',
	uiOptionModalLoading: 'features.like-letter.ui.option_modal.loading',
	uiOptionModalHint: 'features.like-letter.ui.option_modal.hint',

	// ui.insufficient_modal
	uiInsufficientModalTitle: 'features.like-letter.ui.insufficient_modal.title',
	uiInsufficientModalDescription: 'features.like-letter.ui.insufficient_modal.description',
	uiInsufficientModalChargeAndWrite: 'features.like-letter.ui.insufficient_modal.charge_and_write',
	uiInsufficientModalChargeSubText: 'features.like-letter.ui.insufficient_modal.charge_sub_text',
	uiInsufficientModalSendSimpleLike: 'features.like-letter.ui.insufficient_modal.send_simple_like',
	uiInsufficientModalLater: 'features.like-letter.ui.insufficient_modal.later',

	// ui.write_screen
	uiWriteScreenTitle: 'features.like-letter.ui.write_screen.title',
	uiWriteScreenDefaultNickname: 'features.like-letter.ui.write_screen.default_nickname',
	uiWriteScreenViewProfile: 'features.like-letter.ui.write_screen.view_profile',
	uiWriteScreenPlaceholder: 'features.like-letter.ui.write_screen.placeholder',
	uiWriteScreenPreviewButton: 'features.like-letter.ui.write_screen.preview_button',
	uiWriteScreenPreviewTitle: 'features.like-letter.ui.write_screen.preview_title',
	uiWriteScreenSendButton: 'features.like-letter.ui.write_screen.send_button',
	uiWriteScreenSending: 'features.like-letter.ui.write_screen.sending',

	// ui.prompts
	uiPromptsHeader: 'features.like-letter.ui.prompts.header',

	// ui.preview
	uiPreviewTitle: 'features.like-letter.ui.preview.title',
	uiPreviewConfirm: 'features.like-letter.ui.preview.confirm',

	// ui.input
	uiInputPlaceholder: 'features.like-letter.ui.input.placeholder',

	// ui.preview_card
	uiPreviewCardStartChat: 'features.like-letter.ui.preview_card.start_chat',

	// validation
	validationMaxLength: 'features.like-letter.validation.max_length',
	validationContactInfo: 'features.like-letter.validation.contact_info',
	validationInappropriate: 'features.like-letter.validation.inappropriate',

	// prompts
	promptsTravel: 'features.like-letter.prompts.travel',
	promptsRunning: 'features.like-letter.prompts.running',
	promptsDesign: 'features.like-letter.prompts.design',

	// success
	successTitleWithLetter: 'features.like-letter.success.title_with_letter',
	successTitleWithoutLetter: 'features.like-letter.success.title_without_letter',
	successSubtitleWithLetter: 'features.like-letter.success.subtitle_with_letter',
	successSubtitleWithoutLetter: 'features.like-letter.success.subtitle_without_letter',
	successSubtitleLine2: 'features.like-letter.success.subtitle_line2',
	successConfirm: 'features.like-letter.success.confirm',

	// error
	errorInsufficientGems: 'features.like-letter.error.insufficient_gems',
	errorTicketRequired: 'features.like-letter.error.ticket_required',
	errorCommunicationRestricted: 'features.like-letter.error.communication_restricted',
	errorDuplicateLike: 'features.like-letter.error.duplicate_like',
	errorDuplicateRequest: 'features.like-letter.error.duplicate_request',
	errorGeneric: 'features.like-letter.error.generic',
} as const;

export type LikeLetterKey = (typeof LIKE_LETTER_KEYS)[keyof typeof LIKE_LETTER_KEYS];
