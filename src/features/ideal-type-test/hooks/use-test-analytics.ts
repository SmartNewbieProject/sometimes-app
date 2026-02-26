import {
	type IdealTypeAbandonProperties,
	type IdealTypeAuthSheetProperties,
	type IdealTypeQuestionProperties,
	type IdealTypeResultProperties,
	type IdealTypeRetakeProperties,
	type IdealTypeShareProperties,
	type IdealTypeTestBaseProperties,
	MIXPANEL_EVENTS,
} from '@/src/shared/constants/mixpanel-events';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';

const COMMON_PROPERTIES = {
	test_version: 'v2',
	env: process.env.EXPO_PUBLIC_TRACKING_MODE,
} as const;

/**
 * 이상형 테스트 애널리틱스 훅
 * 이상형 테스트 관련 Mixpanel 이벤트를 추적합니다.
 */
export const useTestAnalytics = () => {
	/**
	 * 진입 버튼 클릭 이벤트
	 */
	const trackEntryClicked = (properties: IdealTypeTestBaseProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_ENTRY_CLICKED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 테스트 시작 이벤트
	 */
	const trackTestStarted = (properties: IdealTypeTestBaseProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_STARTED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 질문 화면 노출 이벤트
	 */
	const trackQuestionViewed = (properties: IdealTypeQuestionProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_QUESTION_VIEWED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 질문 답변 이벤트
	 */
	const trackQuestionAnswered = (properties: IdealTypeQuestionProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_QUESTION_ANSWERED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 테스트 완료 이벤트
	 */
	const trackTestCompleted = (properties: IdealTypeResultProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_COMPLETED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 회원가입 버튼 클릭 이벤트
	 */
	const trackSignupClicked = (properties: IdealTypeResultProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_SIGNUP_CLICKED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 재시작 버튼 클릭 이벤트
	 */
	const trackRetakeClicked = (properties: IdealTypeResultProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_RETAKE_CLICKED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 공유 이벤트
	 */
	const trackShared = (properties: IdealTypeShareProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_SHARED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 테스트 이탈 이벤트
	 */
	const trackAbandoned = (properties: IdealTypeAbandonProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_TEST_ABANDONED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 결과 조회 이벤트
	 */
	const trackResultViewed = (properties: IdealTypeResultProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_RESULT_VIEWED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * Auth 시트 노출 이벤트
	 */
	const trackAuthSheetShown = (properties: IdealTypeAuthSheetProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_AUTH_SHEET_SHOWN, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * Auth 시트 닫기 이벤트
	 */
	const trackAuthSheetDismissed = (properties: IdealTypeAuthSheetProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_AUTH_SHEET_DISMISSED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * Auth 방법 선택 이벤트
	 */
	const trackAuthMethodSelected = (properties: IdealTypeAuthSheetProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_AUTH_METHOD_SELECTED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 재시작 차단 이벤트 (쿨다운)
	 */
	const trackRetakeBlocked = (properties: IdealTypeRetakeProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_RETAKE_BLOCKED, {
			...COMMON_PROPERTIES,
			...properties,
		});
	};

	/**
	 * 결과 CTA 클릭 이벤트
	 */
	const trackResultCtaClicked = (properties: IdealTypeResultProperties) => {
		mixpanelAdapter.track(MIXPANEL_EVENTS.IDEAL_TYPE_RESULT_CTA_CLICKED, {
			...COMMON_PROPERTIES,
			...properties,
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
		trackResultViewed,
		trackAuthSheetShown,
		trackAuthSheetDismissed,
		trackAuthMethodSelected,
		trackRetakeBlocked,
		trackResultCtaClicked,
	};
};
