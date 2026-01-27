/**
 * Profile Viewer Feature i18n Keys
 * 프로필 조회 기능 관련 번역 키 상수
 */
export const PROFILE_VIEWER_KEYS = {
	// floating_summary_card
	floatingSummaryCardViewerCountText:
		'features.profile-viewer.floating_summary_card.viewer_count_text',
	floatingSummaryCardViewerCountPrefix:
		'features.profile-viewer.floating_summary_card.viewer_count_prefix',
	floatingSummaryCardViewerCountSuffix:
		'features.profile-viewer.floating_summary_card.viewer_count_suffix',
	floatingSummaryCardAccessibilityLabel:
		'features.profile-viewer.floating_summary_card.accessibility_label',

	// viewed_me
	viewedMeHeaderTitle: 'features.profile-viewer.viewed_me.header_title',
	viewedMeDescription: 'features.profile-viewer.viewed_me.description',
	viewedMeEmptyTitle: 'features.profile-viewer.viewed_me.empty_title',
	viewedMeEmptyDescription: 'features.profile-viewer.viewed_me.empty_description',
	viewedMeLoading: 'features.profile-viewer.viewed_me.loading',
	viewedMeAnchorText: 'features.profile-viewer.viewed_me.anchor_text',

	// viewed_me.card
	viewedMeCardViewCount: 'features.profile-viewer.viewed_me.card.view_count',
	viewedMeCardViewCountMore: 'features.profile-viewer.viewed_me.card.view_count_more',
	viewedMeCardLastViewed: 'features.profile-viewer.viewed_me.card.last_viewed',
	viewedMeCardFreeUnlock: 'features.profile-viewer.viewed_me.card.free_unlock',
	viewedMeCardRevealButton: 'features.profile-viewer.viewed_me.card.reveal_button',
	viewedMeCardRevealCost: 'features.profile-viewer.viewed_me.card.reveal_cost',
	viewedMeCardLikeButton: 'features.profile-viewer.viewed_me.card.like_button',
	viewedMeCardLikedLabel: 'features.profile-viewer.viewed_me.card.liked_label',

	// reveal_confirm
	revealConfirmTitle: 'features.profile-viewer.reveal_confirm.title',
	revealConfirmCostInfo: 'features.profile-viewer.reveal_confirm.cost_info',
	revealConfirmFreeLabel: 'features.profile-viewer.reveal_confirm.free_label',
	revealConfirmFreeInfo: 'features.profile-viewer.reveal_confirm.free_info',
	revealConfirmButton: 'features.profile-viewer.reveal_confirm.confirm_button',
	revealCancelButton: 'features.profile-viewer.reveal_confirm.cancel_button',

	// insufficient_gem
	insufficientGemTitle: 'features.profile-viewer.insufficient_gem.title',
	insufficientGemDescription: 'features.profile-viewer.insufficient_gem.description',
	chargeGemButton: 'features.profile-viewer.insufficient_gem.charge_button',
	cancelButton: 'features.profile-viewer.insufficient_gem.cancel_button',

	// free_unlock_fab
	freeUnlockFabAvailable: 'features.profile-viewer.free_unlock_fab.available',
	freeUnlockFabCountdown: 'features.profile-viewer.free_unlock_fab.countdown',
	freeUnlockFabCountdownPrefix: 'features.profile-viewer.free_unlock_fab.countdown_prefix',
	freeUnlockFabGemHint: 'features.profile-viewer.free_unlock_fab.gem_hint',
	freeUnlockFabAvailableTitle: 'features.profile-viewer.free_unlock_fab.available_title',
	freeUnlockFabAvailableSubtitle: 'features.profile-viewer.free_unlock_fab.available_subtitle',

	// interaction_status
	interactionStatusILiked: 'features.profile-viewer.interaction_status.i_liked',
	interactionStatusTheyLiked: 'features.profile-viewer.interaction_status.they_liked',
	interactionStatusMutual: 'features.profile-viewer.interaction_status.mutual',
} as const;

export type ProfileViewerKey = (typeof PROFILE_VIEWER_KEYS)[keyof typeof PROFILE_VIEWER_KEYS];
