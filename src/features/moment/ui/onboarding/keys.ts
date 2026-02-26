/**
 * Moment Onboarding i18n Keys
 * 모먼트 온보딩 기능 관련 번역 키 상수
 */
export const MOMENT_ONBOARDING_KEYS = {
	intro: {
		title: 'features.moment.onboarding.intro.title',
		subtitle: 'features.moment.onboarding.intro.subtitle',
		feature1: 'features.moment.onboarding.intro.feature1',
		feature2: 'features.moment.onboarding.intro.feature2',
		feature3: 'features.moment.onboarding.intro.feature3',
		startButton: 'features.moment.onboarding.intro.start_button',
		skipButton: 'features.moment.onboarding.intro.skip_button',
	},
	questions: {
		headerTitle: 'features.moment.onboarding.questions.header_title',
		nextButton: 'features.moment.onboarding.questions.next_button',
		submitButton: 'features.moment.onboarding.questions.submit_button',
		placeholder: 'features.moment.onboarding.questions.placeholder',
		tabText: 'features.moment.onboarding.questions.tab_text',
		tabChoice: 'features.moment.onboarding.questions.tab_choice',
	},
	loading: {
		message: 'features.moment.onboarding.loading.message',
	},
	result: {
		completeTitle: 'features.moment.onboarding.result.complete_title',
		startMomentButton: 'features.moment.onboarding.result.start_moment_button',
		insight1Title: 'features.moment.onboarding.result.insight1_title',
		insight2Title: 'features.moment.onboarding.result.insight2_title',
		keywordsTitle: 'features.moment.onboarding.result.keywords_title',
		insightsTitle: 'features.moment.onboarding.result.insights_title',
		radarExtraversion: 'features.moment.onboarding.result.radar_extraversion',
		radarOpenness: 'features.moment.onboarding.result.radar_openness',
		radarConscientiousness: 'features.moment.onboarding.result.radar_conscientiousness',
		radarAgreeableness: 'features.moment.onboarding.result.radar_agreeableness',
		radarNeuroticism: 'features.moment.onboarding.result.radar_neuroticism',
	},
} as const;

export type MomentOnboardingKey =
	(typeof MOMENT_ONBOARDING_KEYS)[keyof typeof MOMENT_ONBOARDING_KEYS][keyof (typeof MOMENT_ONBOARDING_KEYS)[keyof typeof MOMENT_ONBOARDING_KEYS]];
