import { useCallback, useMemo } from 'react';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { storage } from '@/src/shared/libs/store';
import { getCountryFromLocale } from '@/src/shared/libs/country-detector';
import {
	MIXPANEL_EVENTS,
	EVENT_SOURCES,
	LOGIN_ABANDONED_STEPS,
	type BaseEventProperties,
	type SignupEventProperties,
	type PaymentEventProperties,
	type KpiEventTypePropertiesMap,
	type LoginAbandonedStep,
	type AuthMethod,
} from '@/src/shared/constants/mixpanel-events';

const VALID_EVENT_VALUES = new Set(Object.values(MIXPANEL_EVENTS));

// Mixpanel 훅 반환 타입
export interface UseMixpanelReturn {
	// 기본 이벤트 추적
	trackEvent: <T extends string>(
		eventName: T,
		properties?: KpiEventTypePropertiesMap[string],
		options?: { immediate?: boolean; validate?: boolean },
	) => void;

	// 도메인별 전용 훅들
	authEvents: {
		trackLoginStarted: (authMethod: string) => void;
		trackLoginCompleted: (authMethod: string, duration: number) => void;
		trackLoginFailed: (authMethod: string, errorType: string) => void;
		trackLoginAbandoned: (
			authMethod: AuthMethod,
			abandonedStep: LoginAbandonedStep,
			options?: { timeSpentSeconds?: number; isRetry?: boolean; retryCount?: number },
		) => void;
	};

	accountEvents: {
		trackAccountDeletionRequested: (reason: string, reasonDetail?: string) => void;
		trackAccountDeletionCancelled: (reason?: string) => void;
		trackAccountDeleted: (
			deletionReason: string,
			userStats: {
				daysSinceSignup?: number;
				totalMatchesCount?: number;
				hasPurchased?: boolean;
				totalSpent?: number;
				lastActiveDaysAgo?: number;
			},
		) => void;
		trackAccountReactivated: () => void;
	};

	signupEvents: {
		trackSignupStarted: (source?: string) => void;
		trackProfileImageUploaded: (imageCount: number) => void;
		trackInterestSelected: (category: string, selectionCount: number) => void;
		trackSignupCompleted: (completionRate: number, totalDuration: number) => void;
	};

	matchingEvents: {
		trackMatchingStarted: (matchingType: string, filters?: string[]) => void;
		trackProfileViewed: (profileId: string, viewDuration: number) => void;
		trackMatchingRequested: (profileId: string, gemCost?: number) => void;
		trackMatchingSuccess: (matchedProfileId: string, timeToMatch: number) => void;
		trackMatchingFailed: (
			errorReason: string,
			options?: {
				retryAvailableAt?: string;
				failureCategory?: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
				isRecoverable?: boolean;
			},
		) => void;
	};

	chatEvents: {
		trackChatStarted: (
			chatPartnerId: string,
			matchType?: string,
			timeSinceMatchAccepted?: number,
		) => void;
		trackMessageSent: (
			chatId: string,
			messageType: string,
			options?: {
				messageLength?: number;
				isFirstMessage?: boolean;
				timeSinceChatStartSeconds?: number;
				chatPartnerId?: string;
			},
		) => void;
		trackChatEnded: (
			chatId: string,
			chatDuration: number,
			messageCount: number,
			endReason: string,
		) => void;
		trackGiftSent: (chatId: string, giftType: string) => void;
		trackChatResponse: (
			chatId: string,
			responseTimeSeconds: number,
			isFirstResponse: boolean,
			conversationDepth: number,
		) => void;
	};

	communityEvents: {
		trackPostCreated: (category: string, hasImage: boolean) => void;
		trackPostViewed: (postId: string, viewDuration: number) => void;
		trackPostLiked: (postId: string) => void;
		trackCommentAdded: (postId: string, commentLength: number) => void;
		trackPostShared: (postId: string, sharePlatform: string) => void;
		trackFeedViewed: (entryPoint: string, feedType: string) => void;
		trackPostReported: (postId: string, reportReason: string, reporterUserId?: string) => void;
		trackPostDeleted: (postId: string, deleteReason: string, postAge: number) => void;
	};

	paymentEvents: {
		trackStoreViewed: (storeType: string) => void;
		trackItemSelected: (itemType: string, itemValue: number) => void;
		trackPaymentCompleted: (
			transactionId: string,
			paymentMethod: string,
			totalAmount: number,
			items: any[],
		) => void;
		trackPaymentFailed: (paymentMethod: string, errorReason: string) => void;
		trackGemUsed: (usageType: string, gemCount: number) => void;
		trackTicketUsed: (ticketType: string) => void;
	};

	momentEvents: {
		trackQuestionViewed: (questionId: string, questionCategory: string) => void;
		trackAnswerSubmitted: (questionId: string, answerType: string, timeToAnswer: number) => void;
		trackAnswerShared: (questionId: string, sharePlatform: string) => void;
		trackOtherAnswersViewed: (questionId: string, answersViewed: number) => void;
	};

	referralEvents: {
		trackInviteSent: (inviteMethod: string) => void;
		trackInviteAccepted: (inviteCode: string) => void;
		trackReferralSignupCompleted: (referrerId: string) => void;
		trackRewardGranted: (
			referrerId: string,
			refereeId: string,
			rewardType: string,
			rewardValue: number,
		) => void;
	};

	sessionEvents: {
		trackSessionStarted: (sessionStartReason: string) => void;
		trackSessionEnded: (sessionDuration: number) => void;
		trackPushNotificationOpened: (notificationType: string) => void;
		trackFirstSessionCompleted: (
			sessionDurationSeconds: number,
			actionsCompleted: string[],
		) => void;
	};

	// 1. 사용자 온보딩 퍼널 이벤트
	onboardingEvents: {
		trackUniversityVerificationStarted: () => void;
		trackUniversityVerificationCompleted: (verificationMethod: string) => void;
		trackProfileCompletionUpdated: (completionRate: number, completedFields: string[]) => void;
		trackProfilePhotoUploaded: (photoCount: number) => void;
		trackOnboardingStarted: (source?: string) => void;
		trackOnboardingCompleted: (
			completionTimeSeconds: number,
			profileCompletionRate: number,
			skippedSteps: string[],
			completedOptionalFields: string[],
		) => void;
		trackOnboardingStepCompleted: (stepName: string, stepNumber: number) => void;
	};

	// 2. 매칭 효율성 이벤트
	matchingEfficiencyEvents: {
		trackMatchRequestSent: (targetProfileId: string, requestType: string) => void;
		trackMatchAccepted: (sourceProfileId: string, timeToResponse: number) => Promise<void>;
		trackMatchRejected: (sourceProfileId: string, rejectionReason?: string) => void;
		trackFirstMessageSentAfterMatch: (
			matchId: string,
			chatId: string,
			chatPartnerId: string,
			timeToMessage: number,
		) => void;
		trackMatchConversationRate: (matchId: string, conversationStarted: boolean) => void;
		trackMatchCardViewed: (profileId: string, viewDuration: number) => void;
		trackMatchTimeToResponse: (matchId: string, responseType: string, responseTime: number) => void;
	};

	// 3. 커뮤니티 참여도 이벤트
	communityEngagementEvents: {
		trackArticleCreated: (category: string, hasImage: boolean, estimatedReadTime?: number) => void;
		trackArticleLiked: (articleId: string, articleCategory: string) => void;
		trackArticleCommented: (articleId: string, commentLength: number, isReply: boolean) => void;
		trackArticleShared: (articleId: string, sharePlatform: string) => void;
		trackArticleViewed: (articleId: string, viewDuration: number, scrollDepth: number) => void;
		trackCommunityDailyActiveUsers: (activityType: string, sessionDuration: number) => void;
		trackArticleBookmarked: (articleId: string, category: string) => void;
		trackArticleReported: (articleId: string, reportReason: string) => void;
	};

	// 4. 결제 전환율 이벤트
	conversionEvents: {
		trackPaymentInitiated: (itemType: string, itemValue: number, paymentMethod?: string) => void;
		trackPaymentCompleted: (
			transactionId: string,
			paymentMethod: string,
			totalAmount: number,
			itemsPurchased: any[],
		) => void;
		trackPaymentFailed: (paymentMethod: string, errorReason: string, amount?: number) => void;
		trackPaymentCancelled: (reason: string, stage: string) => void;
		trackRematchPurchased: (price: number, originalMatchId?: string) => void;
		trackSubscriptionStarted: (planType: string, trialPeriod?: boolean) => void;
		trackSubscriptionRenewed: (planType: string, renewalCount: number) => void;
		trackSubscriptionCancelled: (reason: string, subscriptionAge: number) => void;
		trackRevenuePerUser: (totalRevenue: number, transactionCount: number) => void;
		trackPaymentMethodAdded: (methodType: string) => void;
		trackPaymentMethodRemoved: (methodType: string) => void;
	};

	featureEvents: {
		trackAppOpened: () => void;
		trackAppBackgrounded: () => void;
		trackFeatureUsed: (
			featureName: string,
			featureCategory: string,
			usageDuration?: number,
		) => void;
	};

	somemateEvents: {
		trackSessionStarted: (sessionId: string, category: string) => void;
		trackSessionCompleted: (
			sessionId: string,
			turnCount: number,
			satisfactionScore?: number,
		) => void;
		trackMessageSent: (sessionId: string, messageType: string, messageLength?: number) => void;
		trackMessageReceived: (sessionId: string, messageType: string, responseTime?: number) => void;
		trackAnalysisStarted: (sessionId: string) => void;
		trackAnalysisCompleted: (sessionId: string, duration: number) => void;
		trackReportViewed: (reportId: string, category: string) => void;
		trackReportShared: (reportId: string, platform: string) => void;
		trackCategorySelected: (category: string) => void;
		trackSessionAbandoned: (
			sessionId: string,
			abandonedAtTurn: number,
			timeSpentSeconds: number,
			lastMessageType: string,
		) => void;
		trackFeedbackSubmitted: (
			sessionId: string,
			messageId: string,
			feedbackType: 'positive' | 'negative',
			feedbackDetail?: string,
		) => void;
		trackFollowUpQuestion: (
			sessionId: string,
			previousSessionId: string,
			daysSinceLastSession: number,
			sameCategory: boolean,
		) => void;
	};

	retentionEvents: {
		trackReactivation: (
			daysSinceLastActive: number,
			reactivationSource: string,
			previousChurnRisk?: number,
		) => void;
		trackFeatureAdopted: (
			featureName: string,
			daysSinceSignup: number,
			adoptionSource: string,
		) => void;
	};
}

export const useMixpanel = (): UseMixpanelReturn => {
	// 공통 속성 추가 및 이벤트 추적
	const trackEvent = useCallback(
		<T extends string>(
			eventName: T,
			properties: KpiEventTypePropertiesMap[string] = {},
			options?: { immediate?: boolean; validate?: boolean },
		) => {
			const opts = { immediate: options?.immediate ?? false, validate: options?.validate ?? true };
			try {
				// 기본 공통 속성
				// country는 Super Properties로 자동 추가됨 (app/_layout.tsx 참고)
				const baseProperties: BaseEventProperties = {
					env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'development',
					timestamp: Date.now(),
					app_version: '1.0.0', // 실제 앱 버전으로 변경 필요
				};

				// 속성 병합
				const eventProperties = {
					...baseProperties,
					...properties,
				};

				// 이벤트 유효성 검사 (옵션)
				if (opts.validate && !VALID_EVENT_VALUES.has(eventName)) {
					console.warn(`[Mixpanel] Unknown event: ${eventName}`);
					return;
				}

				// Mixpanel 이벤트 전송 (플랫폼 자동 선택)
				mixpanelAdapter.track(eventName, eventProperties);

				// 개발 환경에서 로그 출력
				if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
					console.log(`[Mixpanel] Event tracked:`, {
						event: eventName,
						properties: eventProperties,
					});
				}
			} catch (error) {
				console.error('[Mixpanel] Error tracking event:', error);
			}
		},
		[],
	);

	// User Properties 업데이트 헬퍼 함수
	const updateUserProperties = useCallback((properties: Record<string, any>) => {
		try {
			mixpanelAdapter.setUserProperties(properties);

			if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
				console.log(`[Mixpanel] User properties updated:`, properties);
			}
		} catch (error) {
			console.error('[Mixpanel] Error updating user properties:', error);
		}
	}, []);

	// 인증 이벤트들
	const authEvents = {
		trackLoginStarted: useCallback(
			(authMethod: string) => {
				trackEvent('Auth_Login_Started', { auth_method: authMethod as any });
			},
			[trackEvent],
		),

		trackLoginCompleted: useCallback(
			(authMethod: string, duration: number) => {
				trackEvent('Auth_Login_Completed', {
					auth_method: authMethod as any,
					login_duration: duration,
				});
			},
			[trackEvent],
		),

		trackLoginFailed: useCallback(
			(authMethod: string, errorType: string) => {
				trackEvent('Auth_Login_Failed', {
					auth_method: authMethod as any,
					error_type: errorType,
				});
			},
			[trackEvent],
		),

		trackLoginAbandoned: useCallback(
			(
				authMethod: AuthMethod,
				abandonedStep: LoginAbandonedStep,
				options?: { timeSpentSeconds?: number; isRetry?: boolean; retryCount?: number },
			) => {
				trackEvent('Auth_Login_Abandoned', {
					auth_method: authMethod,
					abandoned_step: abandonedStep,
					time_spent_seconds: options?.timeSpentSeconds,
					is_retry: options?.isRetry,
					retry_count: options?.retryCount,
				});
			},
			[trackEvent],
		),
	};

	// 회원 관리 이벤트들
	const accountEvents = {
		trackAccountDeletionRequested: useCallback(
			(reason: string, reasonDetail?: string) => {
				trackEvent('Account_Deletion_Requested', {
					deletion_reason: reason as any,
					deletion_reason_detail: reasonDetail,
				});
			},
			[trackEvent],
		),

		trackAccountDeletionCancelled: useCallback(
			(reason?: string) => {
				trackEvent('Account_Deletion_Cancelled', {
					deletion_reason: reason as any,
				});
			},
			[trackEvent],
		),

		trackAccountDeleted: useCallback(
			(
				deletionReason: string,
				userStats: {
					daysSinceSignup?: number;
					totalMatchesCount?: number;
					hasPurchased?: boolean;
					totalSpent?: number;
					lastActiveDaysAgo?: number;
				},
			) => {
				trackEvent('Account_Deleted', {
					deletion_reason: deletionReason as any,
					days_since_signup: userStats.daysSinceSignup,
					total_matches_count: userStats.totalMatchesCount,
					has_purchased: userStats.hasPurchased,
					total_spent: userStats.totalSpent,
					last_active_days_ago: userStats.lastActiveDaysAgo,
				});
			},
			[trackEvent],
		),

		trackAccountReactivated: useCallback(() => {
			trackEvent('Account_Reactivated', {});
		}, [trackEvent]),
	};

	// 가입 이벤트들
	const signupEvents = {
		trackSignupStarted: useCallback(
			(source?: string) => {
				trackEvent('Signup_Started', { source: source as any });
			},
			[trackEvent],
		),

		trackProfileImageUploaded: useCallback(
			(imageCount: number) => {
				trackEvent('Signup_Profile_Image_Uploaded', { image_count: imageCount });
			},
			[trackEvent],
		),

		trackInterestSelected: useCallback(
			(category: string, selectionCount: number) => {
				trackEvent('Signup_Interest_Selected', {
					category,
					selection_count: selectionCount,
				});
			},
			[trackEvent],
		),

		trackSignupCompleted: useCallback(
			(completionRate: number, totalDuration: number) => {
				trackEvent('Signup_Completed', {
					profile_completion_rate: completionRate,
					total_duration: totalDuration,
				});
			},
			[trackEvent],
		),
	};

	// 매칭 이벤트들
	const matchingEvents = {
		trackMatchingStarted: useCallback(
			(matchingType: string, filters?: string[]) => {
				trackEvent('Matching_Started', {
					matching_type: matchingType as any,
					filters_applied: filters,
				});
			},
			[trackEvent],
		),

		trackProfileViewed: useCallback(
			(profileId: string, viewDuration: number) => {
				trackEvent('Matching_Profile_Viewed', {
					profile_id: profileId,
					view_duration: viewDuration,
				});
			},
			[trackEvent],
		),

		trackMatchingRequested: useCallback(
			(profileId: string, gemCost?: number) => {
				trackEvent('Matching_Requested', {
					profile_id: profileId,
					gem_cost: gemCost,
				});
			},
			[trackEvent],
		),

		trackMatchingSuccess: useCallback(
			(matchedProfileId: string, timeToMatch: number) => {
				trackEvent('Matching_Success', {
					matched_profile_id: matchedProfileId,
					time_to_match: timeToMatch,
				});

				// User Properties 자동 업데이트: 매칭 성공 횟수 증가
				updateUserProperties({
					$add: { total_matches: 1 },
					last_match_date: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackMatchingFailed: useCallback(
			(
				errorReason: string,
				options?: {
					retryAvailableAt?: string;
					failureCategory?: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
					isRecoverable?: boolean;
				},
			) => {
				trackEvent('Matching_Failed', {
					error_reason: errorReason,
					retry_available_at: options?.retryAvailableAt,
					failure_category: options?.failureCategory,
					is_recoverable: options?.isRecoverable,
				});
			},
			[trackEvent],
		),
	};

	// 채팅 이벤트들
	const chatEvents = {
		trackChatStarted: useCallback(
			(chatPartnerId: string, matchType?: string, timeSinceMatchAccepted?: number) => {
				trackEvent('Chat_Started', {
					chat_partner_id: chatPartnerId,
					match_type: matchType as any,
					...(timeSinceMatchAccepted !== undefined && {
						time_since_match_accepted: timeSinceMatchAccepted,
					}),
				});
			},
			[trackEvent],
		),

		trackMessageSent: useCallback(
			(
				chatId: string,
				messageType: string,
				options?: {
					messageLength?: number;
					isFirstMessage?: boolean;
					timeSinceChatStartSeconds?: number;
					chatPartnerId?: string;
				},
			) => {
				trackEvent('Chat_Message_Sent', {
					chat_id: chatId,
					message_type: messageType as any,
					...(options?.messageLength !== undefined && { message_length: options.messageLength }),
					...(options?.isFirstMessage !== undefined && {
						is_first_message: options.isFirstMessage,
					}),
					...(options?.timeSinceChatStartSeconds !== undefined && {
						time_since_chat_start_seconds: options.timeSinceChatStartSeconds,
					}),
					...(options?.chatPartnerId && { chat_partner_id: options.chatPartnerId }),
				});
			},
			[trackEvent],
		),

		trackChatEnded: useCallback(
			(chatId: string, chatDuration: number, messageCount: number, endReason: string) => {
				trackEvent('Chat_Ended', {
					chat_id: chatId,
					chat_duration: chatDuration,
					message_count: messageCount,
					end_reason: endReason as any,
				});
			},
			[trackEvent],
		),

		trackGiftSent: useCallback(
			(chatId: string, giftType: string) => {
				trackEvent('Chat_Gift_Sent', {
					chat_id: chatId,
					gift_type: giftType,
				});
			},
			[trackEvent],
		),

		trackChatResponse: useCallback(
			(
				chatId: string,
				responseTimeSeconds: number,
				isFirstResponse: boolean,
				conversationDepth: number,
			) => {
				trackEvent('Chat_Response', {
					chat_id: chatId,
					response_time_seconds: responseTimeSeconds,
					is_first_response: isFirstResponse,
					conversation_depth: conversationDepth,
				});

				// User Properties 자동 업데이트: 양방향 대화 참여
				updateUserProperties({
					$add: { total_chat_responses_received: 1 },
				});
			},
			[trackEvent, updateUserProperties],
		),
	};

	// 커뮤니티 이벤트들
	const communityEvents = {
		trackPostCreated: useCallback(
			(category: string, hasImage: boolean) => {
				trackEvent('Community_Post_Created', {
					category,
					has_image: hasImage,
				});
			},
			[trackEvent],
		),

		trackPostViewed: useCallback(
			(postId: string, viewDuration: number) => {
				trackEvent('Community_Post_Viewed', {
					post_id: postId,
					view_duration: viewDuration,
				});
			},
			[trackEvent],
		),

		trackPostLiked: useCallback(
			(postId: string) => {
				trackEvent('Community_Post_Liked', { post_id: postId });
			},
			[trackEvent],
		),

		trackCommentAdded: useCallback(
			(postId: string, commentLength: number) => {
				trackEvent('Community_Comment_Added', {
					post_id: postId,
					comment_length: commentLength,
				});
			},
			[trackEvent],
		),

		trackPostShared: useCallback(
			(postId: string, sharePlatform: string) => {
				trackEvent('Community_Post_Shared', {
					post_id: postId,
					share_platform: sharePlatform,
				});
			},
			[trackEvent],
		),

		trackFeedViewed: useCallback(
			(entryPoint: string, feedType: string) => {
				trackEvent('Community_Feed_Viewed', {
					entry_point: entryPoint,
					feed_type: feedType,
				});

				// User Properties 자동 업데이트: 피드 조회 횟수
				updateUserProperties({
					$add: { total_feed_views: 1 },
					last_feed_view_date: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackPostReported: useCallback(
			(postId: string, reportReason: string, reporterUserId?: string) => {
				trackEvent('Community_Post_Reported', {
					post_id: postId,
					report_reason: reportReason,
					reporter_user_id: reporterUserId,
				});
			},
			[trackEvent],
		),

		trackPostDeleted: useCallback(
			(postId: string, deleteReason: string, postAge: number) => {
				trackEvent('Community_Post_Deleted', {
					post_id: postId,
					delete_reason: deleteReason,
					post_age_hours: postAge,
				});
			},
			[trackEvent],
		),
	};

	// 결제 이벤트들
	const paymentEvents = {
		trackStoreViewed: useCallback(
			(storeType: string) => {
				trackEvent('Payment_Store_Viewed', { store_type: storeType });
			},
			[trackEvent],
		),

		trackItemSelected: useCallback(
			(itemType: string, itemValue: number) => {
				trackEvent('Payment_Item_Selected', {
					item_type: itemType,
					item_value: itemValue,
				});
			},
			[trackEvent],
		),

		trackPaymentCompleted: useCallback(
			(transactionId: string, paymentMethod: string, totalAmount: number, items: any[]) => {
				trackEvent('Payment_Completed', {
					transaction_id: transactionId,
					payment_method: paymentMethod as any,
					total_amount: totalAmount,
					items_purchased: items,
				});

				// User Properties 자동 업데이트: 결제 관련 정보
				updateUserProperties({
					has_purchased: true,
					$add: {
						total_spent: totalAmount,
						purchase_count: 1,
					},
					$set_once: {
						first_purchase_date: new Date().toISOString(),
					},
					last_purchase_date: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackPaymentFailed: useCallback(
			(paymentMethod: string, errorReason: string) => {
				trackEvent('Payment_Failed', {
					payment_method: paymentMethod as any,
					error_reason: errorReason,
				});
			},
			[trackEvent],
		),

		trackGemUsed: useCallback(
			(usageType: string, gemCount: number) => {
				trackEvent('Payment_Gem_Used', {
					usage_type: usageType,
					gem_count: gemCount,
				});
			},
			[trackEvent],
		),

		trackTicketUsed: useCallback(
			(ticketType: string) => {
				trackEvent('Payment_Ticket_Used', { usage_type: ticketType });
			},
			[trackEvent],
		),
	};

	// 모먼트 이벤트들
	const momentEvents = {
		trackQuestionViewed: useCallback(
			(questionId: string, questionCategory: string) => {
				trackEvent('Moment_Question_Viewed', {
					question_id: questionId,
					question_category: questionCategory,
				});
			},
			[trackEvent],
		),

		trackAnswerSubmitted: useCallback(
			(questionId: string, answerType: string, timeToAnswer: number) => {
				trackEvent('Moment_Answer_Submitted', {
					question_id: questionId,
					answer_type: answerType,
					time_to_answer: timeToAnswer,
				});
			},
			[trackEvent],
		),

		trackAnswerShared: useCallback(
			(questionId: string, sharePlatform: string) => {
				trackEvent('Moment_Answer_Shared', {
					question_id: questionId,
					share_platform: sharePlatform,
				});
			},
			[trackEvent],
		),

		trackOtherAnswersViewed: useCallback(
			(questionId: string, answersViewed: number) => {
				trackEvent('Moment_Other_Answers_Viewed', {
					question_id: questionId,
					answers_viewed: answersViewed,
				});
			},
			[trackEvent],
		),
	};

	// 추천 이벤트들
	const referralEvents = {
		trackInviteSent: useCallback(
			(inviteMethod: string) => {
				trackEvent('Referral_Invite_Sent', { invite_method: inviteMethod });
			},
			[trackEvent],
		),

		trackInviteAccepted: useCallback(
			(inviteCode: string) => {
				trackEvent('Referral_Invite_Accepted', { invite_code: inviteCode });
			},
			[trackEvent],
		),

		trackReferralSignupCompleted: useCallback(
			(referrerId: string) => {
				trackEvent('Referral_Signup_Completed', { referrer_id: referrerId });
			},
			[trackEvent],
		),

		trackRewardGranted: useCallback(
			(referrerId: string, refereeId: string, rewardType: string, rewardValue: number) => {
				trackEvent('Referral_Reward_Granted', {
					referrer_id: referrerId,
					referee_id: refereeId,
					reward_type: rewardType,
					reward_value: rewardValue,
				});

				// User Properties 자동 업데이트: 추천 보상 누적
				updateUserProperties({
					$add: {
						total_referral_rewards: rewardValue,
						successful_referrals: 1,
					},
				});
			},
			[trackEvent, updateUserProperties],
		),
	};

	// 세션 이벤트들
	const sessionEvents = {
		trackSessionStarted: useCallback(
			(sessionStartReason: string) => {
				trackEvent('Session_Started', { session_start_reason: sessionStartReason });

				// User Properties 자동 업데이트: 마지막 활동 날짜
				updateUserProperties({
					last_active_date: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackSessionEnded: useCallback(
			(sessionDuration: number) => {
				trackEvent('Session_Ended', { session_duration: sessionDuration });
			},
			[trackEvent],
		),

		trackPushNotificationOpened: useCallback(
			(notificationType: string) => {
				trackEvent('Push_Notification_Opened', { notification_type: notificationType });
			},
			[trackEvent],
		),

		trackFirstSessionCompleted: useCallback(
			(sessionDurationSeconds: number, actionsCompleted: string[]) => {
				trackEvent('First_Session_Completed', {
					session_duration_seconds: sessionDurationSeconds,
					actions_completed: actionsCompleted,
					actions_count: actionsCompleted.length,
				});

				// User Properties 자동 업데이트: 첫 세션 완료 표시
				updateUserProperties({
					first_session_completed: true,
					first_session_duration_seconds: sessionDurationSeconds,
					$set_once: {
						first_session_completion_date: new Date().toISOString(),
					},
				});
			},
			[trackEvent, updateUserProperties],
		),
	};

	// 기능 사용 이벤트들
	const featureEvents = {
		trackAppOpened: useCallback(() => {
			trackEvent('App_Opened');
		}, [trackEvent]),

		trackAppBackgrounded: useCallback(() => {
			trackEvent('App_Backgrounded');
		}, [trackEvent]),

		trackFeatureUsed: useCallback(
			(featureName: string, featureCategory: string, usageDuration?: number) => {
				trackEvent('Feature_Used', {
					feature_name: featureName,
					feature_category: featureCategory,
					usage_duration: usageDuration,
				});
			},
			[trackEvent],
		),
	};

	// 썸메이트 이벤트들
	const somemateEvents = {
		trackSessionStarted: useCallback(
			(sessionId: string, category: string) => {
				trackEvent('Somemate_Session_Started', {
					session_id: sessionId,
					category: category as any,
				});
			},
			[trackEvent],
		),

		trackSessionCompleted: useCallback(
			(sessionId: string, turnCount: number, satisfactionScore?: number) => {
				trackEvent('Somemate_Session_Completed', {
					session_id: sessionId,
					turn_count: turnCount,
					satisfaction_score: satisfactionScore,
				});

				// User Properties 자동 업데이트: Somemate 사용 통계
				updateUserProperties({
					has_used_somemate: true,
					$add: {
						total_somemate_sessions: 1,
						total_somemate_turns: turnCount,
					},
					$set_once: {
						first_somemate_date: new Date().toISOString(),
					},
					last_somemate_date: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackMessageSent: useCallback(
			(sessionId: string, messageType: string, messageLength?: number) => {
				trackEvent('Somemate_Message_Sent', {
					session_id: sessionId,
					message_type: messageType as any,
					message_length: messageLength,
				});
			},
			[trackEvent],
		),

		trackMessageReceived: useCallback(
			(sessionId: string, messageType: string, responseTime?: number) => {
				trackEvent('Somemate_Message_Received', {
					session_id: sessionId,
					message_type: messageType as any,
					response_time: responseTime,
				});
			},
			[trackEvent],
		),

		trackAnalysisStarted: useCallback(
			(sessionId: string) => {
				trackEvent('Somemate_Analysis_Started', { session_id: sessionId });
			},
			[trackEvent],
		),

		trackAnalysisCompleted: useCallback(
			(sessionId: string, duration: number) => {
				trackEvent('Somemate_Analysis_Completed', {
					session_id: sessionId,
					analysis_duration: duration,
				});
			},
			[trackEvent],
		),

		trackReportViewed: useCallback(
			(reportId: string, category: string) => {
				trackEvent('Somemate_Report_Viewed', {
					report_id: reportId,
					report_category: category,
				});
			},
			[trackEvent],
		),

		trackReportShared: useCallback(
			(reportId: string, platform: string) => {
				trackEvent('Somemate_Report_Shared', {
					report_id: reportId,
					share_platform: platform,
				});
			},
			[trackEvent],
		),

		trackCategorySelected: useCallback(
			(category: string) => {
				trackEvent('Somemate_Category_Selected', { category: category as any });
			},
			[trackEvent],
		),

		trackSessionAbandoned: useCallback(
			(
				sessionId: string,
				abandonedAtTurn: number,
				timeSpentSeconds: number,
				lastMessageType: string,
			) => {
				trackEvent('Somemate_Session_Abandoned', {
					session_id: sessionId,
					abandoned_at_turn: abandonedAtTurn,
					time_spent_seconds: timeSpentSeconds,
					last_message_type: lastMessageType,
				});
			},
			[trackEvent],
		),

		trackFeedbackSubmitted: useCallback(
			(
				sessionId: string,
				messageId: string,
				feedbackType: 'positive' | 'negative',
				feedbackDetail?: string,
			) => {
				trackEvent('Somemate_Feedback_Submitted', {
					session_id: sessionId,
					message_id: messageId,
					feedback_type: feedbackType,
					feedback_detail: feedbackDetail,
				});
			},
			[trackEvent],
		),

		trackFollowUpQuestion: useCallback(
			(
				sessionId: string,
				previousSessionId: string,
				daysSinceLastSession: number,
				sameCategory: boolean,
			) => {
				trackEvent('Somemate_Follow_Up_Question', {
					session_id: sessionId,
					previous_session_id: previousSessionId,
					days_since_last_session: daysSinceLastSession,
					same_category: sameCategory,
				});
			},
			[trackEvent],
		),
	};

	// 1. 사용자 온보딩 퍼널 구현
	const onboardingEvents = {
		trackUniversityVerificationStarted: useCallback(() => {
			trackEvent('University_Verification_Started', {
				source: 'university_verification',
			});
		}, [trackEvent]),

		trackUniversityVerificationCompleted: useCallback(
			(verificationMethod: string) => {
				trackEvent('University_Verification_Completed', {
					verification_method: verificationMethod,
					source: 'university_verification',
				});
			},
			[trackEvent],
		),

		trackProfileCompletionUpdated: useCallback(
			(completionRate: number, completedFields: string[]) => {
				trackEvent('Profile_Completion_Updated', {
					profile_completion_rate: completionRate,
					completed_fields: completedFields,
					fields_count: completedFields.length,
				});

				// User Properties 자동 업데이트: 프로필 완성도
				updateUserProperties({
					profile_completion_rate: completionRate,
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackProfilePhotoUploaded: useCallback(
			(photoCount: number) => {
				trackEvent('Profile_Photo_Uploaded', {
					image_count: photoCount,
					source: 'profile_setup',
				});
			},
			[trackEvent],
		),

		trackOnboardingStarted: useCallback(
			(source?: string) => {
				trackEvent('Onboarding_Started', {
					source: (source ||
						EVENT_SOURCES.DIRECT) as (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES],
				});
			},
			[trackEvent],
		),

		trackOnboardingCompleted: useCallback(
			(
				completionTimeSeconds: number,
				profileCompletionRate: number,
				skippedSteps: string[],
				completedOptionalFields: string[],
			) => {
				trackEvent('Onboarding_Completed', {
					completion_time_seconds: completionTimeSeconds,
					profile_completion_rate: profileCompletionRate,
					skipped_steps: skippedSteps,
					completed_optional_fields: completedOptionalFields,
				});

				// User Properties 자동 업데이트
				updateUserProperties({
					onboarding_completed: true,
					onboarding_completion_date: new Date().toISOString(),
					$set_once: {
						time_to_onboarding_completion_seconds: completionTimeSeconds,
					},
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackOnboardingStepCompleted: useCallback(
			(stepName: string, stepNumber: number) => {
				trackEvent('Onboarding_Step_Completed', {
					step_name: stepName,
					step_number: stepNumber,
				});
			},
			[trackEvent],
		),
	};

	// 2. 매칭 효율성 구현
	const matchingEfficiencyEvents = {
		trackMatchRequestSent: useCallback(
			(targetProfileId: string, requestType: string) => {
				trackEvent('Match_Request_Sent', {
					profile_id: targetProfileId,
					request_type: requestType,
					matching_type: requestType as any,
				});
			},
			[trackEvent],
		),

		trackMatchAccepted: useCallback(
			async (sourceProfileId: string, timeToResponse: number) => {
				trackEvent('Match_Accepted', {
					profile_id: sourceProfileId,
					time_to_response: timeToResponse,
					response_type: 'accepted',
				});

				// User Properties 자동 업데이트: 상호 좋아요 횟수 증가
				updateUserProperties({
					$add: {
						mutual_likes_count: 1,
						successful_matches: 1,
					},
				});

				// Match_Accepted 시각을 저장 (Chat_Started와의 시간 차이 계산용)
				try {
					await storage.setItem(`match_accepted_time_${sourceProfileId}`, Date.now().toString());
				} catch (error) {
					console.error('[Mixpanel] Failed to save match accepted time:', error);
				}
			},
			[trackEvent, updateUserProperties],
		),

		trackMatchRejected: useCallback(
			(sourceProfileId: string, rejectionReason?: string) => {
				trackEvent('Match_Rejected', {
					profile_id: sourceProfileId,
					rejection_reason: rejectionReason || 'user_initiated',
					response_type: 'rejected',
				});
			},
			[trackEvent],
		),

		trackFirstMessageSentAfterMatch: useCallback(
			(matchId: string, chatId: string, chatPartnerId: string, timeToMessage: number) => {
				trackEvent('First_Message_Sent_After_Match', {
					match_id: matchId,
					chat_id: chatId,
					chat_partner_id: chatPartnerId,
					time_to_message: timeToMessage,
					conversation_started: true,
				});
			},
			[trackEvent],
		),

		trackMatchConversationRate: useCallback(
			(matchId: string, conversationStarted: boolean) => {
				trackEvent('Match_Conversation_Rate', {
					match_id: matchId,
					conversation_started: conversationStarted,
				});
			},
			[trackEvent],
		),

		trackMatchCardViewed: useCallback(
			(profileId: string, viewDuration: number) => {
				trackEvent('Match_Card_Viewed', {
					profile_id: profileId,
					view_duration: viewDuration,
					matching_type: 'view',
				});
			},
			[trackEvent],
		),

		trackMatchTimeToResponse: useCallback(
			(matchId: string, responseType: string, responseTime: number) => {
				trackEvent('Match_Time_To_Response', {
					match_id: matchId,
					response_type: responseType,
					time_to_response: responseTime,
				});
			},
			[trackEvent],
		),
	};

	// 3. 커뮤니티 참여도 구현
	const communityEngagementEvents = {
		trackArticleCreated: useCallback(
			(category: string, hasImage: boolean, estimatedReadTime?: number) => {
				trackEvent('Article_Created', {
					category,
					has_image: hasImage,
					estimated_read_time: estimatedReadTime,
					source: 'community',
				});
			},
			[trackEvent],
		),

		trackArticleLiked: useCallback(
			(articleId: string, articleCategory: string) => {
				trackEvent('Article_Liked', {
					post_id: articleId,
					category: articleCategory,
					interaction_type: 'like',
				});
			},
			[trackEvent],
		),

		trackArticleCommented: useCallback(
			(articleId: string, commentLength: number, isReply: boolean) => {
				trackEvent('Article_Commented', {
					post_id: articleId,
					comment_length: commentLength,
					is_reply: isReply,
					interaction_type: 'comment',
				});
			},
			[trackEvent],
		),

		trackArticleShared: useCallback(
			(articleId: string, sharePlatform: string) => {
				trackEvent('Article_Shared', {
					post_id: articleId,
					share_platform: sharePlatform,
					interaction_type: 'share',
				});
			},
			[trackEvent],
		),

		trackArticleViewed: useCallback(
			(articleId: string, viewDuration: number, scrollDepth: number) => {
				trackEvent('Article_Viewed', {
					post_id: articleId,
					view_duration: viewDuration,
					scroll_depth: scrollDepth,
					interaction_type: 'view',
				});
			},
			[trackEvent],
		),

		trackCommunityDailyActiveUsers: useCallback(
			(activityType: string, sessionDuration: number) => {
				trackEvent('Community_Daily_Active_Users', {
					activity_type: activityType,
					session_duration: sessionDuration,
					source: 'community',
				});
			},
			[trackEvent],
		),

		trackArticleBookmarked: useCallback(
			(articleId: string, category: string) => {
				trackEvent('Article_Bookmarked', {
					post_id: articleId,
					category,
					interaction_type: 'bookmark',
				});
			},
			[trackEvent],
		),

		trackArticleReported: useCallback(
			(articleId: string, reportReason: string) => {
				trackEvent('Article_Reported', {
					post_id: articleId,
					report_reason: reportReason,
					interaction_type: 'report',
				});
			},
			[trackEvent],
		),
	};

	// 4. 결제 전환율 구현
	const conversionEvents = {
		trackPaymentInitiated: useCallback(
			(itemType: string, itemValue: number, paymentMethod?: string) => {
				trackEvent('Payment_Initiated', {
					item_type: itemType,
					item_value: itemValue,
					payment_method: paymentMethod as any,
					source: 'payment_flow',
				});
			},
			[trackEvent],
		),

		trackPaymentCompleted: useCallback(
			(
				transactionId: string,
				paymentMethod: string,
				totalAmount: number,
				itemsPurchased: any[],
			) => {
				trackEvent('Payment_Completed', {
					transaction_id: transactionId,
					payment_method: paymentMethod as any,
					total_amount: totalAmount,
					items_purchased: itemsPurchased,
					source: 'payment_success',
				});
			},
			[trackEvent],
		),

		trackPaymentFailed: useCallback(
			(paymentMethod: string, errorReason: string, amount?: number) => {
				trackEvent('Payment_Failed', {
					payment_method: paymentMethod as any,
					error_reason: errorReason,
					total_amount: amount,
					source: 'payment_failure',
				});
			},
			[trackEvent],
		),

		trackPaymentCancelled: useCallback(
			(reason: string, stage: string) => {
				trackEvent('Payment_Cancelled', {
					reason,
					stage,
					source: 'payment_cancellation',
				});
			},
			[trackEvent],
		),

		trackRematchPurchased: useCallback(
			(price: number, originalMatchId?: string) => {
				trackEvent('Rematch_Purchased', {
					item_value: price,
					original_match_id: originalMatchId,
					item_type: 'rematch_ticket',
					matching_type: 'rematch',
				});
			},
			[trackEvent],
		),

		trackSubscriptionStarted: useCallback(
			(planType: string, trialPeriod?: boolean) => {
				trackEvent('Subscription_Started', {
					item_type: planType,
					trial_period: trialPeriod || false,
					source: EVENT_SOURCES.SUBSCRIPTION_START,
				});
			},
			[trackEvent],
		),

		trackSubscriptionRenewed: useCallback(
			(planType: string, renewalCount: number) => {
				trackEvent('Subscription_Renewed', {
					item_type: planType,
					renewal_count: renewalCount,
					source: EVENT_SOURCES.SUBSCRIPTION_RENEWAL,
				});
			},
			[trackEvent],
		),

		trackSubscriptionCancelled: useCallback(
			(reason: string, subscriptionAge: number) => {
				trackEvent('Subscription_Cancelled', {
					reason,
					subscription_age: subscriptionAge,
					source: 'subscription_cancellation',
				});
			},
			[trackEvent],
		),

		trackRevenuePerUser: useCallback(
			(totalRevenue: number, transactionCount: number) => {
				trackEvent('Revenue_Per_User', {
					total_amount: totalRevenue,
					transaction_count: transactionCount,
					source: 'revenue_tracking',
				});
			},
			[trackEvent],
		),

		trackPaymentMethodAdded: useCallback(
			(methodType: string) => {
				trackEvent('Payment_Method_Added', {
					payment_method: methodType as any,
					source: 'payment_management',
				});
			},
			[trackEvent],
		),

		trackPaymentMethodRemoved: useCallback(
			(methodType: string) => {
				trackEvent('Payment_Method_Removed', {
					payment_method: methodType as any,
					source: 'payment_management',
				});
			},
			[trackEvent],
		),
	};

	// 리텐션 이벤트들
	const retentionEvents = {
		trackReactivation: useCallback(
			(daysSinceLastActive: number, reactivationSource: string, previousChurnRisk?: number) => {
				trackEvent('Reactivation', {
					days_since_last_active: daysSinceLastActive,
					reactivation_source: reactivationSource,
					previous_churn_risk: previousChurnRisk,
				});

				// User Properties 자동 업데이트: 재활성화 표시
				updateUserProperties({
					is_reactivated_user: true,
					last_reactivation_date: new Date().toISOString(),
					$add: { reactivation_count: 1 },
				});
			},
			[trackEvent, updateUserProperties],
		),

		trackFeatureAdopted: useCallback(
			(featureName: string, daysSinceSignup: number, adoptionSource: string) => {
				trackEvent('Feature_Adopted', {
					feature_name: featureName,
					days_since_signup: daysSinceSignup,
					adoption_source: adoptionSource,
				});

				// User Properties 자동 업데이트: 채택한 기능 목록에 추가
				updateUserProperties({
					[`feature_${featureName}_adopted`]: true,
					[`feature_${featureName}_adoption_date`]: new Date().toISOString(),
				});
			},
			[trackEvent, updateUserProperties],
		),
	};

	return {
		trackEvent,
		authEvents,
		accountEvents,
		signupEvents,
		matchingEvents,
		chatEvents,
		communityEvents,
		paymentEvents,
		momentEvents,
		referralEvents,
		sessionEvents,
		featureEvents,
		somemateEvents,
		onboardingEvents,
		matchingEfficiencyEvents,
		communityEngagementEvents,
		conversionEvents,
		retentionEvents,
	};
};
