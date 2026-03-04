/**
 * Moment Onboarding i18n Keys
 * 모먼트 온보딩 기능 관련 번역 키 상수
 */
export const MOMENT_ONBOARDING_KEYS = {
	intro: {
		title: 'features.moment.onboarding.intro.title',
		subtitle: 'features.moment.onboarding.intro.subtitle',
		startButton: 'features.moment.onboarding.intro.start_button',
		skipButton: 'features.moment.onboarding.intro.skip_button',
		beforeTag: 'features.moment.onboarding.intro.before_tag',
		afterTag: 'features.moment.onboarding.intro.after_tag',
		beforeName: 'features.moment.onboarding.intro.before_name',
		afterName: 'features.moment.onboarding.intro.after_name',
		beforeTrait1: 'features.moment.onboarding.intro.before_trait1',
		beforeTrait3: 'features.moment.onboarding.intro.before_trait3',
		afterTrait1: 'features.moment.onboarding.intro.after_trait1',
		afterTrait2: 'features.moment.onboarding.intro.after_trait2',
		afterTrait3: 'features.moment.onboarding.intro.after_trait3',
		benefitMatching: 'features.moment.onboarding.intro.benefit_matching',
		benefitConversation: 'features.moment.onboarding.intro.benefit_conversation',
		benefitInsight: 'features.moment.onboarding.intro.benefit_insight',
		ctaSubtext: 'features.moment.onboarding.intro.cta_subtext',
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
		statsTitle: 'features.moment.onboarding.result.stats_title',
		radarChartTitle: 'features.moment.onboarding.result.radar_chart_title',
		patternsTitle: 'features.moment.onboarding.result.patterns_title',
		storyTitle: 'features.moment.onboarding.result.story_title',
		growthTitle: 'features.moment.onboarding.result.growth_title',
		personaTitle: 'features.moment.onboarding.result.persona_title',
		dimensionDescExtraversion: 'features.moment.onboarding.result.dimension_desc_extraversion',
		dimensionDescOpenness: 'features.moment.onboarding.result.dimension_desc_openness',
		dimensionDescConscientiousness:
			'features.moment.onboarding.result.dimension_desc_conscientiousness',
		dimensionDescAgreeableness: 'features.moment.onboarding.result.dimension_desc_agreeableness',
		dimensionDescNeuroticism: 'features.moment.onboarding.result.dimension_desc_neuroticism',
	},
} as const;

export type MomentOnboardingKey =
	(typeof MOMENT_ONBOARDING_KEYS)[keyof typeof MOMENT_ONBOARDING_KEYS][keyof (typeof MOMENT_ONBOARDING_KEYS)[keyof typeof MOMENT_ONBOARDING_KEYS]];
