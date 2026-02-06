/**
 * Ideal Type Test Feature i18n Keys
 * 이상형 테스트 기능 관련 번역 키 상수
 */
export const IDEAL_TYPE_TEST_KEYS = {
	// start
	startTitle: 'features.ideal-type-test.start.title',
	startSubtitle: 'features.ideal-type-test.start.subtitle',
	startFeature1: 'features.ideal-type-test.start.feature_1',
	startFeature2: 'features.ideal-type-test.start.feature_2',
	startFeature3: 'features.ideal-type-test.start.feature_3',
	startButton: 'features.ideal-type-test.start.start_button',
	startLoading: 'features.ideal-type-test.start.loading',
	startAlreadyCompletedTitle: 'features.ideal-type-test.start.already_completed_title',
	startAlreadyCompletedSubtitle: 'features.ideal-type-test.start.already_completed_subtitle',
	startViewResultButton: 'features.ideal-type-test.start.view_result_button',
	startRetakeTestButton: 'features.ideal-type-test.start.retake_test_button',

	// questions
	questionsQuestionNumber: 'features.ideal-type-test.questions.question_number',
	questionsProgressInfo: 'features.ideal-type-test.questions.progress_info',

	// result
	resultStatsTitle: 'features.ideal-type-test.result.stats_title',
	resultStatsDescription: 'features.ideal-type-test.result.stats_description',
	resultSignupPrompt: 'features.ideal-type-test.result.signup_prompt',
	resultShareButton: 'features.ideal-type-test.result.share_button',
	resultRetakeButton: 'features.ideal-type-test.result.retake_button',
	resultSignupButton: 'features.ideal-type-test.result.signup_button',
	resultStartMatchingButton: 'features.ideal-type-test.result.start_matching_button',
	resultLoggedInInfo: 'features.ideal-type-test.result.logged_in_info',

	// errors
	errorsStartFailed: 'features.ideal-type-test.errors.start_failed',
	errorsSubmitFailed: 'features.ideal-type-test.errors.submit_failed',
	errorsNetworkError: 'features.ideal-type-test.errors.network_error',
	errorsSessionExpired: 'features.ideal-type-test.errors.session_expired',

	// prompt
	promptTitle: 'features.ideal-type-test.prompt.title',
	promptFeature1: 'features.ideal-type-test.prompt.feature_1',
	promptFeature2: 'features.ideal-type-test.prompt.feature_2',
	promptFeature3: 'features.ideal-type-test.prompt.feature_3',
	promptCtaButton: 'features.ideal-type-test.prompt.cta_button',
	promptDismissHint: 'features.ideal-type-test.prompt.dismiss_hint',
} as const;

export type IdealTypeTestKey = (typeof IDEAL_TYPE_TEST_KEYS)[keyof typeof IDEAL_TYPE_TEST_KEYS];
