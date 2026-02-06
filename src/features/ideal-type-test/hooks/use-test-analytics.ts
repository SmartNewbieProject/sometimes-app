import { MIXPANEL_EVENTS, type BaseEventProperties } from '@/src/shared/constants/mixpanel-events';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

// 이상형 테스트 관련 이벤트 속성 타입
interface IdealTypeTestEventProperties extends BaseEventProperties {
	entry_source?: string;
}

interface IdealTypeQuestionEventProperties extends BaseEventProperties {
	question_index?: number;
	question_id?: string;
	total_questions?: number;
}

interface IdealTypeAnswerEventProperties extends BaseEventProperties {
	question_index?: number;
	question_id?: string;
	answer_id?: string;
	time_spent_seconds?: number;
}

interface IdealTypeCompletionEventProperties extends BaseEventProperties {
	result_type?: string;
	total_time_seconds?: number;
}

interface IdealTypeShareEventProperties extends BaseEventProperties {
	share_platform?: string;
	result_type?: string;
}

interface IdealTypeAbandonEventProperties extends BaseEventProperties {
	abandoned_at_question?: number;
	time_spent_seconds?: number;
}

/**
 * 이상형 테스트 애널리틱스 훅
 * 이상형 테스트 관련 Mixpanel 이벤트를 추적합니다.
 */
export const useTestAnalytics = () => {
	/**
	 * 진입 버튼 클릭 이벤트
	 */
	const trackEntryClicked = (properties: IdealTypeTestEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_ENTRY_CLICKED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 테스트 시작 이벤트
	 */
	const trackTestStarted = (properties: IdealTypeTestEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_STARTED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 질문 화면 노출 이벤트
	 */
	const trackQuestionViewed = (properties: IdealTypeQuestionEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_QUESTION_VIEWED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 질문 답변 이벤트
	 */
	const trackQuestionAnswered = (properties: IdealTypeAnswerEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_QUESTION_ANSWERED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 테스트 완료 이벤트
	 */
	const trackTestCompleted = (properties: IdealTypeCompletionEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_COMPLETED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 회원가입 버튼 클릭 이벤트
	 */
	const trackSignupClicked = (properties: IdealTypeCompletionEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_SIGNUP_CLICKED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 재시작 버튼 클릭 이벤트
	 */
	const trackRetakeClicked = (properties: IdealTypeCompletionEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_RETAKE_CLICKED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 공유 이벤트
	 */
	const trackShared = (properties: IdealTypeShareEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_SHARED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	/**
	 * 테스트 이탈 이벤트
	 */
	const trackAbandoned = (properties: IdealTypeAbandonEventProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_ABANDONED, {
			...properties,
			env: process.env.EXPO_PUBLIC_TRACKING_MODE,
		});
	};

	return {
		trackEntryClicked,
		trackTestStarted,
		trackQuestionViewed,
		trackQuestionAnswered,
		trackTestCompleted,
		trackSignupClicked,
		trackRetakeClicked,
		trackShared,
		trackAbandoned,
	};
};
