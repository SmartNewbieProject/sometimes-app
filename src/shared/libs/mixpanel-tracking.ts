/**
 * Mixpanel High Priority 지표 Tracking 유틸리티
 * 2025-12-29 추가
 */

import type { Mixpanel } from 'mixpanel-react-native';
import { MIXPANEL_EVENTS } from '../constants/mixpanel-events';
import type {
	PaymentDetailedEventProperties,
	MatchingQueueEventProperties,
	LikeDetailedEventProperties,
	ChatQualityEventProperties,
	RetentionEventProperties,
	FirstExperienceEventProperties,
} from '../constants/mixpanel-events';

export class MixpanelTracker {
	private mixpanel: Mixpanel | null = null;

	constructor(mixpanel: Mixpanel | null) {
		this.mixpanel = mixpanel;
	}

	// ===== 결제 관련 =====

	/**
	 * 결제 이탈 추적
	 */
	trackPaymentAbandoned(properties: PaymentDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.PAYMENT_ABANDONED_CART, properties);
	}

	/**
	 * 첫 구매 추적
	 */
	trackFirstPurchase(properties: PaymentDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.PAYMENT_FIRST_PURCHASE, {
			...properties,
			is_first_purchase: true,
		});
	}

	/**
	 * 재구매 추적
	 */
	trackRepeatPurchase(properties: PaymentDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.PAYMENT_REPEAT_PURCHASE, {
			...properties,
			is_first_purchase: false,
		});
	}

	/**
	 * 젬 부족 감지
	 */
	trackGemBalanceLow(gemBalance: number, requiredGems: number, trigger: string) {
		this.mixpanel?.track(MIXPANEL_EVENTS.GEM_BALANCE_LOW, {
			gem_balance_before: gemBalance,
			gem_required: requiredGems,
			gem_shortage: requiredGems - gemBalance,
			purchase_trigger: trigger,
		});
	}

	/**
	 * 젬 잔액 0
	 */
	trackGemBalanceDepleted(trigger: string) {
		this.mixpanel?.track(MIXPANEL_EVENTS.GEM_BALANCE_DEPLETED, {
			gem_balance_before: 0,
			purchase_trigger: trigger,
		});
	}

	/**
	 * 젬 구매 유도 모달 표시
	 */
	trackGemPurchasePromptShown(properties: PaymentDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.GEM_PURCHASE_PROMPT_SHOWN, properties);
	}

	/**
	 * 젬 구매 유도 모달 무시
	 */
	trackGemPurchasePromptDismissed(properties: PaymentDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.GEM_PURCHASE_PROMPT_DISMISSED, properties);
	}

	// ===== 매칭 관련 =====

	/**
	 * 매칭 대기열 진입
	 */
	trackMatchingQueueJoined(properties: MatchingQueueEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.MATCHING_QUEUE_JOINED, properties);
	}

	/**
	 * 매칭 대기 시간 측정
	 */
	trackMatchingQueueTime(
		waitTimeSeconds: number,
		abandoned: boolean,
		properties?: MatchingQueueEventProperties,
	) {
		this.mixpanel?.track(MIXPANEL_EVENTS.MATCHING_QUEUE_TIME, {
			...properties,
			queue_wait_time_seconds: waitTimeSeconds,
			queue_abandoned: abandoned,
		});
	}

	/**
	 * 매칭 대기 이탈
	 */
	trackMatchingQueueAbandoned(waitTimeSeconds: number, properties?: MatchingQueueEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.MATCHING_QUEUE_ABANDONED, {
			...properties,
			queue_wait_time_seconds: waitTimeSeconds,
			queue_abandoned: true,
		});
	}

	// ===== 좋아요 관련 =====

	/**
	 * 좋아요로 매칭 성사
	 */
	trackLikeMatchCreated(properties: LikeDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.LIKE_MATCH_CREATED, {
			...properties,
			match_created: true,
		});
	}

	/**
	 * 좋아요 한도 도달
	 */
	trackLikeLimitReached(likesRemaining: number, properties?: LikeDetailedEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.LIKE_LIMIT_REACHED, {
			...properties,
			likes_remaining: likesRemaining,
		});
	}

	// ===== 채팅 관련 =====

	/**
	 * 첫 응답 시간 추적
	 */
	trackChatFirstResponseTime(responseTimeSeconds: number, properties: ChatQualityEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.CHAT_FIRST_RESPONSE_TIME, {
			...properties,
			response_time_seconds: responseTimeSeconds,
			is_first_interaction: true,
		});
	}

	/**
	 * 평균 응답 시간 추적
	 */
	trackChatAverageResponseTime(
		responseTimeSeconds: number,
		properties: ChatQualityEventProperties,
	) {
		this.mixpanel?.track(MIXPANEL_EVENTS.CHAT_AVERAGE_RESPONSE_TIME, {
			...properties,
			response_time_seconds: responseTimeSeconds,
		});
	}

	/**
	 * 대화 길이 추적 (메시지 개수)
	 */
	trackChatConversationLength(messageCount: number, properties: ChatQualityEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.CHAT_CONVERSATION_LENGTH, {
			...properties,
			conversation_turn_count: messageCount,
			message_count: messageCount,
		});
	}

	/**
	 * 대화 지속 시간 추적
	 */
	trackChatConversationDuration(durationSeconds: number, properties: ChatQualityEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.CHAT_CONVERSATION_DURATION, {
			...properties,
			chat_duration: durationSeconds,
		});
	}

	// ===== 리텐션 관련 =====

	/**
	 * Day 1 리텐션
	 */
	trackDay1Retention(properties: RetentionEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.DAY_1_RETENTION, {
			...properties,
			days_since_signup: 1,
		});
	}

	/**
	 * Day 3 리텐션
	 */
	trackDay3Retention(properties: RetentionEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.DAY_3_RETENTION, {
			...properties,
			days_since_signup: 3,
		});
	}

	/**
	 * Day 7 리텐션
	 */
	trackDay7Retention(properties: RetentionEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.DAY_7_RETENTION, {
			...properties,
			days_since_signup: 7,
		});
	}

	/**
	 * Day 30 리텐션
	 */
	trackDay30Retention(properties: RetentionEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.DAY_30_RETENTION, {
			...properties,
			days_since_signup: 30,
		});
	}

	// ===== 첫 경험 (Aha Moment) =====

	/**
	 * 첫 매칭 성공
	 */
	trackFirstMatchAchieved(properties: FirstExperienceEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.FIRST_MATCH_ACHIEVED, properties);
	}

	/**
	 * 첫 메시지 전송
	 */
	trackFirstMessageSent(properties: FirstExperienceEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.FIRST_MESSAGE_SENT, properties);
	}

	/**
	 * 첫 메시지 수신
	 */
	trackFirstMessageReceived(properties: FirstExperienceEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.FIRST_MESSAGE_RECEIVED, properties);
	}

	/**
	 * 첫 좋아요 전송
	 */
	trackFirstLikeSent(properties: FirstExperienceEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.FIRST_LIKE_SENT, properties);
	}

	/**
	 * 첫 좋아요 수신
	 */
	trackFirstLikeReceived(properties: FirstExperienceEventProperties) {
		this.mixpanel?.track(MIXPANEL_EVENTS.FIRST_LIKE_RECEIVED, properties);
	}
}

/**
 * 시간 계산 유틸리티
 */
export const calculateDaysSince = (date: Date | string): number => {
	const targetDate = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - targetDate.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 사용자의 첫 액션 여부 체크 (AsyncStorage)
 */
export const checkIsFirstAction = async (actionKey: string): Promise<boolean> => {
	try {
		const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
		const AsyncStorage = AsyncStorageModule.default as unknown as {
			getItem: (key: string) => Promise<string | null>;
			setItem: (key: string, value: string) => Promise<void>;
		};
		const key = `first_action_${actionKey}`;
		const value = await AsyncStorage.getItem(key);

		if (!value) {
			await AsyncStorage.setItem(key, 'true');
			return true;
		}
		return false;
	} catch (error) {
		console.error('Failed to check first action:', error);
		return false;
	}
};
