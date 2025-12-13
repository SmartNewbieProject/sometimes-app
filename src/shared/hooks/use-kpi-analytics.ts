import { useCallback } from 'react';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { AMPLITUDE_KPI_EVENTS } from '@/src/shared/constants/amplitude-kpi-events';
import type {
  BaseEventProperties,
  SignupEventProperties,
  PaymentEventProperties,
} from './use-amplitude.types';
import { KpiEventTypePropertiesMap } from '@/src/shared/constants/amplitude-kpi-events';

// 확장된 KPI 훅 반환 타입
export interface UseKpiAnalyticsReturn {
  // 기본 이벤트 추적
  trackEvent: <T extends string>(
    eventName: T,
    properties?: KpiEventTypePropertiesMap[string],
    options?: { immediate?: boolean; validate?: boolean }
  ) => void;

  // 도메인별 전용 훅들
  authEvents: {
    trackLoginStarted: (authMethod: string) => void;
    trackLoginCompleted: (authMethod: string, duration: number) => void;
    trackLoginFailed: (authMethod: string, errorType: string) => void;
  };

  accountEvents: {
    trackAccountDeletionRequested: (reason: string, reasonDetail?: string) => void;
    trackAccountDeletionCancelled: (reason?: string) => void;
    trackAccountDeleted: (deletionReason: string, userStats: {
      daysSinceSignup?: number;
      totalMatchesCount?: number;
      hasPurchased?: boolean;
      totalSpent?: number;
      lastActiveDaysAgo?: number;
    }) => void;
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
    trackMatchingFailed: (errorReason: string, options?: {
      retryAvailableAt?: string;
      failureCategory?: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
      isRecoverable?: boolean;
    }) => void;
  };

  chatEvents: {
    trackChatStarted: (chatPartnerId: string, matchType?: string) => void;
    trackMessageSent: (chatId: string, messageType: string) => void;
    trackChatEnded: (chatId: string, chatDuration: number, messageCount: number, endReason: string) => void;
    trackGiftSent: (chatId: string, giftType: string) => void;
  };

  communityEvents: {
    trackPostCreated: (category: string, hasImage: boolean) => void;
    trackPostViewed: (postId: string, viewDuration: number) => void;
    trackPostLiked: (postId: string) => void;
    trackCommentAdded: (postId: string, commentLength: number) => void;
    trackPostShared: (postId: string, sharePlatform: string) => void;
  };

  paymentEvents: {
    trackStoreViewed: (storeType: string) => void;
    trackItemSelected: (itemType: string, itemValue: number) => void;
    trackPaymentCompleted: (transactionId: string, paymentMethod: string, totalAmount: number, items: any[]) => void;
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
  };

  sessionEvents: {
    trackSessionStarted: (sessionStartReason: string) => void;
    trackSessionEnded: (sessionDuration: number) => void;
    trackPushNotificationOpened: (notificationType: string) => void;
  };

  // 1. 사용자 온보딩 퍼널 이벤트
  onboardingEvents: {
    trackUniversityVerificationStarted: () => void;
    trackUniversityVerificationCompleted: (verificationMethod: string) => void;
    trackProfileCompletionUpdated: (completionRate: number, completedFields: string[]) => void;
    trackProfilePhotoUploaded: (photoCount: number) => void;
    trackOnboardingStarted: (source?: string) => void;
    trackOnboardingCompleted: (totalDuration: number, stepsCompleted: number) => void;
    trackOnboardingStepCompleted: (stepName: string, stepNumber: number) => void;
  };

  // 2. 매칭 효율성 이벤트
  matchingEfficiencyEvents: {
    trackMatchRequestSent: (targetProfileId: string, requestType: string) => void;
    trackMatchAccepted: (sourceProfileId: string, timeToResponse: number) => void;
    trackMatchRejected: (sourceProfileId: string, rejectionReason?: string) => void;
    trackFirstMessageSentAfterMatch: (matchId: string, timeToMessage: number) => void;
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
    trackPaymentCompleted: (transactionId: string, paymentMethod: string, totalAmount: number, itemsPurchased: any[]) => void;
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
    trackFeatureUsed: (featureName: string, featureCategory: string, usageDuration?: number) => void;
  };

  somemateEvents: {
    trackSessionStarted: (sessionId: string, category: string) => void;
    trackSessionCompleted: (sessionId: string, turnCount: number, satisfactionScore?: number) => void;
    trackMessageSent: (sessionId: string, messageType: string, messageLength?: number) => void;
    trackMessageReceived: (sessionId: string, messageType: string, responseTime?: number) => void;
    trackAnalysisStarted: (sessionId: string) => void;
    trackAnalysisCompleted: (sessionId: string, duration: number) => void;
    trackReportViewed: (reportId: string, category: string) => void;
    trackReportShared: (reportId: string, platform: string) => void;
    trackCategorySelected: (category: string) => void;
  };
}

export const useKpiAnalytics = (): UseKpiAnalyticsReturn => {
  // 공통 속성 추가 및 이벤트 추적
  const trackEvent = useCallback(
    <T extends string>(
      eventName: T,
      properties: KpiEventTypePropertiesMap[string] = {},
      options = { immediate: false, validate: true }
    ) => {
      try {
        // 기본 공통 속성
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
        if (options.validate && !AMPLITUDE_KPI_EVENTS[eventName]) {
          console.warn(`[KPI Analytics] Unknown event: ${eventName}`);
          return;
        }

        // Mixpanel 이벤트 전송 (플랫폼 자동 선택)
        mixpanelAdapter.track(AMPLITUDE_KPI_EVENTS[eventName], eventProperties);

        // 개발 환경에서 로그 출력
        if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
          console.log(`[KPI Analytics] Event tracked:`, {
            event: AMPLITUDE_KPI_EVENTS[eventName],
            properties: eventProperties,
          });
        }
      } catch (error) {
        console.error('[KPI Analytics] Error tracking event:', error);
      }
    },
    []
  );

  // User Properties 업데이트 헬퍼 함수
  const updateUserProperties = useCallback((properties: Record<string, any>) => {
    try {
      mixpanelAdapter.setUserProperties(properties);

      if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
        console.log(`[KPI Analytics] User properties updated:`, properties);
      }
    } catch (error) {
      console.error('[KPI Analytics] Error updating user properties:', error);
    }
  }, []);

  // 인증 이벤트들
  const authEvents = {
    trackLoginStarted: useCallback((authMethod: string) => {
      trackEvent('Auth_Login_Started', { auth_method: authMethod as any });
    }, [trackEvent]),

    trackLoginCompleted: useCallback((authMethod: string, duration: number) => {
      trackEvent('Auth_Login_Completed', {
        auth_method: authMethod as any,
        login_duration: duration
      });
    }, [trackEvent]),

    trackLoginFailed: useCallback((authMethod: string, errorType: string) => {
      trackEvent('Auth_Login_Failed', {
        auth_method: authMethod as any,
        error_type: errorType
      });
    }, [trackEvent]),
  };

  // 회원 관리 이벤트들
  const accountEvents = {
    trackAccountDeletionRequested: useCallback((reason: string, reasonDetail?: string) => {
      trackEvent('Account_Deletion_Requested', {
        deletion_reason: reason as any,
        deletion_reason_detail: reasonDetail,
      });
    }, [trackEvent]),

    trackAccountDeletionCancelled: useCallback((reason?: string) => {
      trackEvent('Account_Deletion_Cancelled', {
        deletion_reason: reason as any,
      });
    }, [trackEvent]),

    trackAccountDeleted: useCallback((deletionReason: string, userStats: {
      daysSinceSignup?: number;
      totalMatchesCount?: number;
      hasPurchased?: boolean;
      totalSpent?: number;
      lastActiveDaysAgo?: number;
    }) => {
      trackEvent('Account_Deleted', {
        deletion_reason: deletionReason as any,
        days_since_signup: userStats.daysSinceSignup,
        total_matches_count: userStats.totalMatchesCount,
        has_purchased: userStats.hasPurchased,
        total_spent: userStats.totalSpent,
        last_active_days_ago: userStats.lastActiveDaysAgo,
      });
    }, [trackEvent]),

    trackAccountReactivated: useCallback(() => {
      trackEvent('Account_Reactivated', {});
    }, [trackEvent]),
  };

  // 가입 이벤트들
  const signupEvents = {
    trackSignupStarted: useCallback((source?: string) => {
      trackEvent('Signup_Started', { source: source as any });
    }, [trackEvent]),

    trackProfileImageUploaded: useCallback((imageCount: number) => {
      trackEvent('Signup_Profile_Image_Uploaded', { image_count: imageCount });
    }, [trackEvent]),

    trackInterestSelected: useCallback((category: string, selectionCount: number) => {
      trackEvent('Signup_Interest_Selected', {
        category,
        selection_count: selectionCount
      });
    }, [trackEvent]),

    trackSignupCompleted: useCallback((completionRate: number, totalDuration: number) => {
      trackEvent('Signup_Completed', {
        profile_completion_rate: completionRate,
        total_duration: totalDuration
      });
    }, [trackEvent]),
  };

  // 매칭 이벤트들
  const matchingEvents = {
    trackMatchingStarted: useCallback((matchingType: string, filters?: string[]) => {
      trackEvent('Matching_Started', {
        matching_type: matchingType as any,
        filters_applied: filters
      });
    }, [trackEvent]),

    trackProfileViewed: useCallback((profileId: string, viewDuration: number) => {
      trackEvent('Matching_Profile_Viewed', {
        profile_id: profileId,
        view_duration: viewDuration
      });
    }, [trackEvent]),

    trackMatchingRequested: useCallback((profileId: string, gemCost?: number) => {
      trackEvent('Matching_Requested', {
        profile_id: profileId,
        gem_cost: gemCost
      });
    }, [trackEvent]),

    trackMatchingSuccess: useCallback((matchedProfileId: string, timeToMatch: number) => {
      trackEvent('Matching_Success', {
        matched_profile_id: matchedProfileId,
        time_to_match: timeToMatch
      });

      // User Properties 자동 업데이트: 매칭 성공 횟수 증가
      updateUserProperties({
        $add: { total_matches: 1 },
        last_match_date: new Date().toISOString(),
      });
    }, [trackEvent, updateUserProperties]),

    trackMatchingFailed: useCallback((errorReason: string, options?: {
      retryAvailableAt?: string;
      failureCategory?: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
      isRecoverable?: boolean;
    }) => {
      trackEvent('Matching_Failed', {
        error_reason: errorReason,
        retry_available_at: options?.retryAvailableAt,
        failure_category: options?.failureCategory,
        is_recoverable: options?.isRecoverable,
      });
    }, [trackEvent]),
  };

  // 채팅 이벤트들
  const chatEvents = {
    trackChatStarted: useCallback((chatPartnerId: string, matchType?: string) => {
      trackEvent('Chat_Started', {
        chat_partner_id: chatPartnerId,
        match_type: matchType as any
      });
    }, [trackEvent]),

    trackMessageSent: useCallback((chatId: string, messageType: string) => {
      trackEvent('Chat_Message_Sent', {
        chat_id: chatId,
        message_type: messageType as any
      });
    }, [trackEvent]),

    trackChatEnded: useCallback((chatId: string, chatDuration: number, messageCount: number, endReason: string) => {
      trackEvent('Chat_Ended', {
        chat_id: chatId,
        chat_duration: chatDuration,
        message_count: messageCount,
        end_reason: endReason as any
      });
    }, [trackEvent]),

    trackGiftSent: useCallback((chatId: string, giftType: string) => {
      trackEvent('Chat_Gift_Sent', {
        chat_id: chatId,
        gift_type: giftType
      });
    }, [trackEvent]),
  };

  // 커뮤니티 이벤트들
  const communityEvents = {
    trackPostCreated: useCallback((category: string, hasImage: boolean) => {
      trackEvent('Community_Post_Created', {
        category,
        has_image: hasImage
      });
    }, [trackEvent]),

    trackPostViewed: useCallback((postId: string, viewDuration: number) => {
      trackEvent('Community_Post_Viewed', {
        post_id: postId,
        view_duration: viewDuration
      });
    }, [trackEvent]),

    trackPostLiked: useCallback((postId: string) => {
      trackEvent('Community_Post_Liked', { post_id: postId });
    }, [trackEvent]),

    trackCommentAdded: useCallback((postId: string, commentLength: number) => {
      trackEvent('Community_Comment_Added', {
        post_id: postId,
        comment_length: commentLength
      });
    }, [trackEvent]),

    trackPostShared: useCallback((postId: string, sharePlatform: string) => {
      trackEvent('Community_Post_Shared', {
        post_id: postId,
        share_platform: sharePlatform
      });
    }, [trackEvent]),
  };

  // 결제 이벤트들
  const paymentEvents = {
    trackStoreViewed: useCallback((storeType: string) => {
      trackEvent('Payment_Store_Viewed', { store_type: storeType });
    }, [trackEvent]),

    trackItemSelected: useCallback((itemType: string, itemValue: number) => {
      trackEvent('Payment_Item_Selected', {
        item_type: itemType,
        item_value: itemValue
      });
    }, [trackEvent]),

    trackPaymentCompleted: useCallback((transactionId: string, paymentMethod: string, totalAmount: number, items: any[]) => {
      trackEvent('Payment_Completed', {
        transaction_id: transactionId,
        payment_method: paymentMethod as any,
        total_amount: totalAmount,
        items_purchased: items
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
    }, [trackEvent, updateUserProperties]),

    trackPaymentFailed: useCallback((paymentMethod: string, errorReason: string) => {
      trackEvent('Payment_Failed', {
        payment_method: paymentMethod as any,
        error_reason: errorReason
      });
    }, [trackEvent]),

    trackGemUsed: useCallback((usageType: string, gemCount: number) => {
      trackEvent('Payment_Gem_Used', {
        usage_type: usageType,
        gem_count: gemCount
      });
    }, [trackEvent]),

    trackTicketUsed: useCallback((ticketType: string) => {
      trackEvent('Payment_Ticket_Used', { usage_type: ticketType });
    }, [trackEvent]),
  };

  // 모먼트 이벤트들
  const momentEvents = {
    trackQuestionViewed: useCallback((questionId: string, questionCategory: string) => {
      trackEvent('Moment_Question_Viewed', {
        question_id: questionId,
        question_category: questionCategory
      });
    }, [trackEvent]),

    trackAnswerSubmitted: useCallback((questionId: string, answerType: string, timeToAnswer: number) => {
      trackEvent('Moment_Answer_Submitted', {
        question_id: questionId,
        answer_type: answerType,
        time_to_answer: timeToAnswer
      });
    }, [trackEvent]),

    trackAnswerShared: useCallback((questionId: string, sharePlatform: string) => {
      trackEvent('Moment_Answer_Shared', {
        question_id: questionId,
        share_platform: sharePlatform
      });
    }, [trackEvent]),

    trackOtherAnswersViewed: useCallback((questionId: string, answersViewed: number) => {
      trackEvent('Moment_Other_Answers_Viewed', {
        question_id: questionId,
        answers_viewed: answersViewed
      });
    }, [trackEvent]),
  };

  // 추천 이벤트들
  const referralEvents = {
    trackInviteSent: useCallback((inviteMethod: string) => {
      trackEvent('Referral_Invite_Sent', { invite_method: inviteMethod });
    }, [trackEvent]),

    trackInviteAccepted: useCallback((inviteCode: string) => {
      trackEvent('Referral_Invite_Accepted', { invite_code: inviteCode });
    }, [trackEvent]),

    trackReferralSignupCompleted: useCallback((referrerId: string) => {
      trackEvent('Referral_Signup_Completed', { referrer_id: referrerId });
    }, [trackEvent]),
  };

  // 세션 이벤트들
  const sessionEvents = {
    trackSessionStarted: useCallback((sessionStartReason: string) => {
      trackEvent('Session_Started', { session_start_reason: sessionStartReason });

      // User Properties 자동 업데이트: 마지막 활동 날짜
      updateUserProperties({
        last_active_date: new Date().toISOString(),
      });
    }, [trackEvent, updateUserProperties]),

    trackSessionEnded: useCallback((sessionDuration: number) => {
      trackEvent('Session_Ended', { session_duration: sessionDuration });
    }, [trackEvent]),

    trackPushNotificationOpened: useCallback((notificationType: string) => {
      trackEvent('Push_Notification_Opened', { notification_type: notificationType });
    }, [trackEvent]),
  };

  // 기능 사용 이벤트들
  const featureEvents = {
    trackAppOpened: useCallback(() => {
      trackEvent('App_Opened');
    }, [trackEvent]),

    trackAppBackgrounded: useCallback(() => {
      trackEvent('App_Backgrounded');
    }, [trackEvent]),

    trackFeatureUsed: useCallback((featureName: string, featureCategory: string, usageDuration?: number) => {
      trackEvent('Feature_Used', {
        feature_name: featureName,
        feature_category: featureCategory,
        usage_duration: usageDuration
      });
    }, [trackEvent]),
  };

  // 썸메이트 이벤트들
  const somemateEvents = {
    trackSessionStarted: useCallback((sessionId: string, category: string) => {
      trackEvent('Somemate_Session_Started', {
        session_id: sessionId,
        category: category as any
      });
    }, [trackEvent]),

    trackSessionCompleted: useCallback((sessionId: string, turnCount: number, satisfactionScore?: number) => {
      trackEvent('Somemate_Session_Completed', {
        session_id: sessionId,
        turn_count: turnCount,
        satisfaction_score: satisfactionScore
      });
    }, [trackEvent]),

    trackMessageSent: useCallback((sessionId: string, messageType: string, messageLength?: number) => {
      trackEvent('Somemate_Message_Sent', {
        session_id: sessionId,
        message_type: messageType as any,
        message_length: messageLength
      });
    }, [trackEvent]),

    trackMessageReceived: useCallback((sessionId: string, messageType: string, responseTime?: number) => {
      trackEvent('Somemate_Message_Received', {
        session_id: sessionId,
        message_type: messageType as any,
        response_time: responseTime
      });
    }, [trackEvent]),

    trackAnalysisStarted: useCallback((sessionId: string) => {
      trackEvent('Somemate_Analysis_Started', { session_id: sessionId });
    }, [trackEvent]),

    trackAnalysisCompleted: useCallback((sessionId: string, duration: number) => {
      trackEvent('Somemate_Analysis_Completed', {
        session_id: sessionId,
        analysis_duration: duration
      });
    }, [trackEvent]),

    trackReportViewed: useCallback((reportId: string, category: string) => {
      trackEvent('Somemate_Report_Viewed', {
        report_id: reportId,
        report_category: category
      });
    }, [trackEvent]),

    trackReportShared: useCallback((reportId: string, platform: string) => {
      trackEvent('Somemate_Report_Shared', {
        report_id: reportId,
        share_platform: platform
      });
    }, [trackEvent]),

    trackCategorySelected: useCallback((category: string) => {
      trackEvent('Somemate_Category_Selected', { category: category as any });
    }, [trackEvent]),
  };

  // 1. 사용자 온보딩 퍼널 구현
  const onboardingEvents = {
    trackUniversityVerificationStarted: useCallback(() => {
      trackEvent('University_Verification_Started', {
        source: 'university_verification'
      });
    }, [trackEvent]),

    trackUniversityVerificationCompleted: useCallback((verificationMethod: string) => {
      trackEvent('University_Verification_Completed', {
        verification_method: verificationMethod,
        source: 'university_verification'
      });
    }, [trackEvent]),

    trackProfileCompletionUpdated: useCallback((completionRate: number, completedFields: string[]) => {
      trackEvent('Profile_Completion_Updated', {
        profile_completion_rate: completionRate,
        completed_fields: completedFields,
        fields_count: completedFields.length
      });

      // User Properties 자동 업데이트: 프로필 완성도
      updateUserProperties({
        profile_completion_rate: completionRate,
      });
    }, [trackEvent, updateUserProperties]),

    trackProfilePhotoUploaded: useCallback((photoCount: number) => {
      trackEvent('Profile_Photo_Uploaded', {
        image_count: photoCount,
        source: 'profile_setup'
      });
    }, [trackEvent]),

    trackOnboardingStarted: useCallback((source?: string) => {
      trackEvent('Onboarding_Started', {
        source: source || 'direct'
      });
    }, [trackEvent]),

    trackOnboardingCompleted: useCallback((totalDuration: number, stepsCompleted: number) => {
      trackEvent('Onboarding_Completed', {
        total_duration: totalDuration,
        steps_completed: stepsCompleted,
        completion_rate: 100
      });
    }, [trackEvent]),

    trackOnboardingStepCompleted: useCallback((stepName: string, stepNumber: number) => {
      trackEvent('Onboarding_Step_Completed', {
        step_name: stepName,
        step_number: stepNumber
      });
    }, [trackEvent]),
  };

  // 2. 매칭 효율성 구현
  const matchingEfficiencyEvents = {
    trackMatchRequestSent: useCallback((targetProfileId: string, requestType: string) => {
      trackEvent('Match_Request_Sent', {
        profile_id: targetProfileId,
        request_type: requestType,
        matching_type: requestType as any
      });
    }, [trackEvent]),

    trackMatchAccepted: useCallback((sourceProfileId: string, timeToResponse: number) => {
      trackEvent('Match_Accepted', {
        profile_id: sourceProfileId,
        time_to_response: timeToResponse,
        response_type: 'accepted'
      });

      // User Properties 자동 업데이트: 상호 좋아요 횟수 증가
      updateUserProperties({
        $add: {
          mutual_likes_count: 1,
          successful_matches: 1,
        },
      });
    }, [trackEvent, updateUserProperties]),

    trackMatchRejected: useCallback((sourceProfileId: string, rejectionReason?: string) => {
      trackEvent('Match_Rejected', {
        profile_id: sourceProfileId,
        rejection_reason: rejectionReason || 'user_initiated',
        response_type: 'rejected'
      });
    }, [trackEvent]),

    trackFirstMessageSentAfterMatch: useCallback((matchId: string, timeToMessage: number) => {
      trackEvent('First_Message_Sent_After_Match', {
        match_id: matchId,
        time_to_message: timeToMessage,
        conversation_started: true
      });
    }, [trackEvent]),

    trackMatchConversationRate: useCallback((matchId: string, conversationStarted: boolean) => {
      trackEvent('Match_Conversation_Rate', {
        match_id: matchId,
        conversation_started: conversationStarted
      });
    }, [trackEvent]),

    trackMatchCardViewed: useCallback((profileId: string, viewDuration: number) => {
      trackEvent('Match_Card_Viewed', {
        profile_id: profileId,
        view_duration: viewDuration,
        matching_type: 'view'
      });
    }, [trackEvent]),

    trackMatchTimeToResponse: useCallback((matchId: string, responseType: string, responseTime: number) => {
      trackEvent('Match_Time_To_Response', {
        match_id: matchId,
        response_type: responseType,
        time_to_response: responseTime
      });
    }, [trackEvent]),
  };

  // 3. 커뮤니티 참여도 구현
  const communityEngagementEvents = {
    trackArticleCreated: useCallback((category: string, hasImage: boolean, estimatedReadTime?: number) => {
      trackEvent('Article_Created', {
        category,
        has_image: hasImage,
        estimated_read_time: estimatedReadTime,
        source: 'community'
      });
    }, [trackEvent]),

    trackArticleLiked: useCallback((articleId: string, articleCategory: string) => {
      trackEvent('Article_Liked', {
        post_id: articleId,
        category: articleCategory,
        interaction_type: 'like'
      });
    }, [trackEvent]),

    trackArticleCommented: useCallback((articleId: string, commentLength: number, isReply: boolean) => {
      trackEvent('Article_Commented', {
        post_id: articleId,
        comment_length: commentLength,
        is_reply: isReply,
        interaction_type: 'comment'
      });
    }, [trackEvent]),

    trackArticleShared: useCallback((articleId: string, sharePlatform: string) => {
      trackEvent('Article_Shared', {
        post_id: articleId,
        share_platform: sharePlatform,
        interaction_type: 'share'
      });
    }, [trackEvent]),

    trackArticleViewed: useCallback((articleId: string, viewDuration: number, scrollDepth: number) => {
      trackEvent('Article_Viewed', {
        post_id: articleId,
        view_duration: viewDuration,
        scroll_depth: scrollDepth,
        interaction_type: 'view'
      });
    }, [trackEvent]),

    trackCommunityDailyActiveUsers: useCallback((activityType: string, sessionDuration: number) => {
      trackEvent('Community_Daily_Active_Users', {
        activity_type: activityType,
        session_duration: sessionDuration,
        source: 'community'
      });
    }, [trackEvent]),

    trackArticleBookmarked: useCallback((articleId: string, category: string) => {
      trackEvent('Article_Bookmarked', {
        post_id: articleId,
        category,
        interaction_type: 'bookmark'
      });
    }, [trackEvent]),

    trackArticleReported: useCallback((articleId: string, reportReason: string) => {
      trackEvent('Article_Reported', {
        post_id: articleId,
        report_reason: reportReason,
        interaction_type: 'report'
      });
    }, [trackEvent]),
  };

  // 4. 결제 전환율 구현
  const conversionEvents = {
    trackPaymentInitiated: useCallback((itemType: string, itemValue: number, paymentMethod?: string) => {
      trackEvent('Payment_Initiated', {
        item_type: itemType,
        item_value: itemValue,
        payment_method: paymentMethod as any,
        source: 'payment_flow'
      });
    }, [trackEvent]),

    trackPaymentCompleted: useCallback((transactionId: string, paymentMethod: string, totalAmount: number, itemsPurchased: any[]) => {
      trackEvent('Payment_Completed', {
        transaction_id: transactionId,
        payment_method: paymentMethod as any,
        total_amount: totalAmount,
        items_purchased: itemsPurchased,
        source: 'payment_success'
      });
    }, [trackEvent]),

    trackPaymentFailed: useCallback((paymentMethod: string, errorReason: string, amount?: number) => {
      trackEvent('Payment_Failed', {
        payment_method: paymentMethod as any,
        error_reason: errorReason,
        total_amount: amount,
        source: 'payment_failure'
      });
    }, [trackEvent]),

    trackPaymentCancelled: useCallback((reason: string, stage: string) => {
      trackEvent('Payment_Cancelled', {
        reason,
        stage,
        source: 'payment_cancellation'
      });
    }, [trackEvent]),

    trackRematchPurchased: useCallback((price: number, originalMatchId?: string) => {
      trackEvent('Rematch_Purchased', {
        item_value: price,
        original_match_id: originalMatchId,
        item_type: 'rematch_ticket',
        matching_type: 'rematch'
      });
    }, [trackEvent]),

    trackSubscriptionStarted: useCallback((planType: string, trialPeriod?: boolean) => {
      trackEvent('Subscription_Started', {
        item_type: planType,
        trial_period: trialPeriod || false,
        source: 'subscription_start'
      });
    }, [trackEvent]),

    trackSubscriptionRenewed: useCallback((planType: string, renewalCount: number) => {
      trackEvent('Subscription_Renewed', {
        item_type: planType,
        renewal_count: renewalCount,
        source: 'subscription_renewal'
      });
    }, [trackEvent]),

    trackSubscriptionCancelled: useCallback((reason: string, subscriptionAge: number) => {
      trackEvent('Subscription_Cancelled', {
        reason,
        subscription_age: subscriptionAge,
        source: 'subscription_cancellation'
      });
    }, [trackEvent]),

    trackRevenuePerUser: useCallback((totalRevenue: number, transactionCount: number) => {
      trackEvent('Revenue_Per_User', {
        total_amount: totalRevenue,
        transaction_count: transactionCount,
        source: 'revenue_tracking'
      });
    }, [trackEvent]),

    trackPaymentMethodAdded: useCallback((methodType: string) => {
      trackEvent('Payment_Method_Added', {
        payment_method: methodType as any,
        source: 'payment_management'
      });
    }, [trackEvent]),

    trackPaymentMethodRemoved: useCallback((methodType: string) => {
      trackEvent('Payment_Method_Removed', {
        payment_method: methodType as any,
        source: 'payment_management'
      });
    }, [trackEvent]),
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
  };
};