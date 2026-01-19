/**
 * Event Feature i18n Keys
 * 이벤트 기능 관련 번역 키 상수
 */
export const EVENT_KEYS = {
	// notification
	notification: 'features.event.notification',

	// ui.community_event_prompt
	uiCommunityEventPromptTitle: 'features.event.ui.community_event_prompt.title',
	uiCommunityEventPromptSubtitle: 'features.event.ui.community_event_prompt.subtitle',
	uiCommunityEventPromptGemLabel: 'features.event.ui.community_event_prompt.gem_label',
	uiCommunityEventPromptRewardText: 'features.event.ui.community_event_prompt.reward_text',
	uiCommunityEventPromptRewardSubtext: 'features.event.ui.community_event_prompt.reward_subtext',
	uiCommunityEventPromptWriteButton: 'features.event.ui.community_event_prompt.write_button',
	uiCommunityEventPromptLaterButton: 'features.event.ui.community_event_prompt.later_button',

	// ui.community_event_error
	uiCommunityEventErrorTitle: 'features.event.ui.community_event_error.title',
	uiCommunityEventErrorMessage: 'features.event.ui.community_event_error.message',

	// ui.university_certification_prompt
	uiUniversityCertificationPromptTitle: 'features.event.ui.university_certification_prompt.title',
	uiUniversityCertificationPromptSubtitle:
		'features.event.ui.university_certification_prompt.subtitle',
	uiUniversityCertificationPromptBenefitText:
		'features.event.ui.university_certification_prompt.benefit_text',
	uiUniversityCertificationPromptRewardSubtext:
		'features.event.ui.university_certification_prompt.reward_subtext',
	uiUniversityCertificationPromptCertifyButton:
		'features.event.ui.university_certification_prompt.certify_button',
	uiUniversityCertificationPromptLaterButton:
		'features.event.ui.university_certification_prompt.later_button',

	// hooks.use_event_control
	hooksUseEventControlEventExpiredComment:
		'features.event.hooks.use_event_control.event_expired_comment',
	hooksUseEventControlEventOverParticipatedComment:
		'features.event.hooks.use_event_control.event_over_participated_comment',

	// hooks.use_share
	hooksUseShareCodeCopied: 'features.event.hooks.use_share.code_copied',
	hooksUseShareLinkCopied: 'features.event.hooks.use_share.link_copied',
	hooksUseShareLoadingCode: 'features.event.hooks.use_share.loading_code',
	hooksUseShareCodeCopyFailed: 'features.event.hooks.use_share.code_copy_failed',
	hooksUseShareLinkCopyFailed: 'features.event.hooks.use_share.link_copy_failed',

	// hooks.use_share_kakao
	hooksUseShareKakaoInviteTitle: 'features.event.hooks.use_share_kakao.invite_title',
	hooksUseShareKakaoInviteDescription: 'features.event.hooks.use_share_kakao.invite_description',
	hooksUseShareKakaoButtonWeb: 'features.event.hooks.use_share_kakao.button_web',
	hooksUseShareKakaoButtonApp: 'features.event.hooks.use_share_kakao.button_app',
	hooksUseShareKakaoSdkInitFailed: 'features.event.hooks.use_share_kakao.sdk_init_failed',
	hooksUseShareKakaoSdkLoadFailed: 'features.event.hooks.use_share_kakao.sdk_load_failed',
	hooksUseShareKakaoShareLoading: 'features.event.hooks.use_share_kakao.share_loading',
	hooksUseShareKakaoKakaoNotReady: 'features.event.hooks.use_share_kakao.kakao_not_ready',
	hooksUseShareKakaoShareFailed: 'features.event.hooks.use_share_kakao.share_failed',

	// common
	commonClose: 'features.event.common.닫기',
	commonGetGems: 'features.event.common.구슬_받기',

	// roulette
	rouletteHeaderTitle: 'features.event.roulette.header_title',
	rouletteTopTitle: 'features.event.roulette.top_title',
	rouletteBottomTitle: 'features.event.roulette.bottom_title',
	rouletteDescription: 'features.event.roulette.description',
	rouletteDescriptionLuck: 'features.event.roulette.description_luck',
	rouletteDescriptionTry: 'features.event.roulette.description_try',
	rouletteDescriptionPartsPrefix: 'features.event.roulette.description_parts.prefix',
	rouletteDescriptionPartsLuck: 'features.event.roulette.description_parts.luck',
	rouletteDescriptionPartsMiddle: 'features.event.roulette.description_parts.middle',
	rouletteDescriptionPartsTry: 'features.event.roulette.description_parts.try',
	rouletteDescriptionPartsSuffix: 'features.event.roulette.description_parts.suffix',
	rouletteStartButton: 'features.event.roulette.start_button',
	rouletteResultZero: 'features.event.roulette.result_zero',
} as const;

export type EventKey = (typeof EVENT_KEYS)[keyof typeof EVENT_KEYS];
