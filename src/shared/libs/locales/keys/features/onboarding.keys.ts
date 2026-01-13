/**
 * Onboarding Feature i18n Keys
 * 온보딩 기능 관련 번역 키 상수
 */
export const ONBOARDING_KEYS = {
	// slides.welcome
	slidesWelcomeHeadline: 'features.onboarding.slides.welcome.headline',
	slidesWelcomeSubtext: 'features.onboarding.slides.welcome.subtext',

	// slides.story
	slidesStoryHeadline: 'features.onboarding.slides.story.headline',
	slidesStorySubtext: 'features.onboarding.slides.story.subtext',

	// slides.matchingTime
	slidesMatchingTimeHeadline: 'features.onboarding.slides.matchingTime.headline',
	slidesMatchingTimeSubtext: 'features.onboarding.slides.matchingTime.subtext',
	slidesMatchingTimeCountdownLabel: 'features.onboarding.slides.matchingTime.countdownLabel',

	// slides.verification
	slidesVerificationHeadline: 'features.onboarding.slides.verification.headline',
	slidesVerificationSubtext: 'features.onboarding.slides.verification.subtext',
	slidesVerificationBadgesPass: 'features.onboarding.slides.verification.badges.pass',
	slidesVerificationBadgesEmail: 'features.onboarding.slides.verification.badges.email',
	slidesVerificationBadgesPhoto: 'features.onboarding.slides.verification.badges.photo',

	// slides.studentOnly
	slidesStudentOnlyHeadline: 'features.onboarding.slides.studentOnly.headline',
	slidesStudentOnlySubtext: 'features.onboarding.slides.studentOnly.subtext',

	// slides.aiMatching
	slidesAiMatchingHeadline: 'features.onboarding.slides.aiMatching.headline',
	slidesAiMatchingSubtext: 'features.onboarding.slides.aiMatching.subtext',

	// slides.likeGuide
	slidesLikeGuideHeadline: 'features.onboarding.slides.likeGuide.headline',
	slidesLikeGuideSubtext: 'features.onboarding.slides.likeGuide.subtext',

	// slides.chatGuide
	slidesChatGuideHeadline: 'features.onboarding.slides.chatGuide.headline',
	slidesChatGuideSubtext: 'features.onboarding.slides.chatGuide.subtext',

	// slides.refund
	slidesRefundHeadline: 'features.onboarding.slides.refund.headline',
	slidesRefundSubtext: 'features.onboarding.slides.refund.subtext',

	// slides.region
	slidesRegionHeadline: 'features.onboarding.slides.region.headline',
	slidesRegionSubtext: 'features.onboarding.slides.region.subtext',

	// slides.cta
	slidesCtaHeadline: 'features.onboarding.slides.cta.headline',
	slidesCtaSubtext: 'features.onboarding.slides.cta.subtext',

	// navigation
	navigationNext: 'features.onboarding.navigation.next',
	navigationStart: 'features.onboarding.navigation.start',
	navigationSkip: 'features.onboarding.navigation.skip',

	// countdown
	countdownFormat: 'features.onboarding.countdown.format',

	// ui
	uiLoginSubtext: 'features.onboarding.ui.login_subtext',
	uiPassLogin: 'features.onboarding.ui.pass_login',
	uiKakaoLogin: 'features.onboarding.ui.kakao_login',
	uiAppleLogin: 'features.onboarding.ui.apple_login',
	uiTypingMessage1: 'features.onboarding.ui.typing_message1',
	uiTypingMessage2: 'features.onboarding.ui.typing_message2',

	// profile_photo
	profilePhotoTitle: 'features.onboarding.profile_photo.title',
	profilePhotoSubtitle: 'features.onboarding.profile_photo.subtitle',
	profilePhotoGuide1: 'features.onboarding.profile_photo.guide_1',
	profilePhotoGuide2: 'features.onboarding.profile_photo.guide_2',
	profilePhotoRequired: 'features.onboarding.profile_photo.required',
	profilePhotoRecommended: 'features.onboarding.profile_photo.recommended',
	profilePhotoMinOneRequired: 'features.onboarding.profile_photo.min_one_required',
	profilePhotoSubmit: 'features.onboarding.profile_photo.submit',
	profilePhotoUploading: 'features.onboarding.profile_photo.uploading',
	profilePhotoBack: 'features.onboarding.profile_photo.back',
} as const;

export type OnboardingKey = (typeof ONBOARDING_KEYS)[keyof typeof ONBOARDING_KEYS];
