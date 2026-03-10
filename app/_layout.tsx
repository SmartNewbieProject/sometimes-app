import '@/src/features/logger/service/patch';
import { isRunningInExpoGo } from 'expo';
import * as Application from 'expo-application';
import { useFonts } from 'expo-font';
import {
	Slot,
	router,
	useLocalSearchParams,
	useNavigationContainerRef,
	usePathname,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import 'react-native-reanimated';
import {
	NOTIFICATION_TYPES,
	type NotificationData,
	handleNotificationTap,
} from '@/src/shared/libs/notifications';
import { getKeyHashAndroid, initializeKakaoSDK } from '@react-native-kakao/core';
import * as Notifications from 'expo-notifications';

import { getCountryFromLocale } from '@/src/shared/libs/country-detector';
import i18n from '@/src/shared/libs/i18n';
import { getUserLanguage } from '@/src/shared/libs/local';
import { I18nextProvider } from 'react-i18next';

import { GlobalChatProvider } from '@/src/features/chat/providers/global-chat-provider';
import { ChatActivityTracker } from '@/src/features/chat/ui/chat-activity-tracker';
import LoggerContainer from '@/src/features/logger/ui/logger-container';
import { VersionUpdateChecker } from '@/src/features/version-update';
import { AppBadgeSync } from '@/src/shared/components/app-badge-sync';
import { LoginRequiredModalListener } from '@/src/shared/components/login-required-modal-listener';
import { OTAUpdateHandler } from '@/src/shared/components/ota-update-handler';
import { PhotoReviewModalListener } from '@/src/shared/components/photo-review-modal-listener';
import { ServerMaintenanceListener } from '@/src/shared/components/server-maintenance-listener';
import { SessionTracker } from '@/src/shared/components/session-tracker';
import { QueryProvider, RouteTracker } from '@/src/shared/config';
import { useAtt } from '@/src/shared/hooks';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { eventBus } from '@/src/shared/libs/event-bus';
import { env } from '@/src/shared/libs/env';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { AnalyticsProvider, ModalProvider, PortalProvider } from '@/src/shared/providers';
import { GlobalLoadingOverlay } from '@/src/shared/ui/global-loading-overlay';
import Toast from '@/src/shared/ui/toast';
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

let navigationIntegration: ReturnType<typeof Sentry.reactNavigationIntegration> | null = null;

try {
	navigationIntegration = Sentry.reactNavigationIntegration({
		enableTimeToInitialDisplay: !isRunningInExpoGo(),
	});

	Sentry.init({
		dsn: 'https://2a33482b7a7b5a1787d3b8c0da4809a9@o4510573549846528.ingest.us.sentry.io/4510573550829568',
		enabled: !__DEV__,
		environment: __DEV__ ? 'development' : 'production',
		release: `${Application.applicationId}@${Application.nativeApplicationVersion}+${Application.nativeBuildVersion}`,
		sendDefaultPii: true,
		tracesSampleRate: 0.2,
		integrations: navigationIntegration ? [navigationIntegration] : [],
		enableNativeFramesTracking: !isRunningInExpoGo(),
	});
} catch (sentryError) {
	console.error('[Sentry] Init failed:', sentryError);
}

if (Platform.OS !== 'web') {
	SplashScreen.preventAutoHideAsync()
		.then(() => console.log('[Splash] prevent OK'))
		.catch((e) => console.log('[Splash] prevent ERR', e));
}

const MIN_SPLASH_MS = 300;
const START_AT = Date.now();

const PRETENDARD_REGULAR = require('../assets/fonts/Pretendard-Regular.otf');
const PRETENDARD_MEDIUM = require('../assets/fonts/Pretendard-Medium.otf');
const PRETENDARD_SEMIBOLD = require('../assets/fonts/Pretendard-SemiBold.otf');
const PRETENDARD_BOLD = require('../assets/fonts/Pretendard-Bold.otf');
const PRETENDARD_EXTRABOLD = require('../assets/fonts/Pretendard-ExtraBold.otf');
const MPLUS_REGULAR = require('../assets/fonts/MPLUS1p-Regular.ttf');
const MPLUS_MEDIUM = require('../assets/fonts/MPLUS1p-Medium.ttf');
const MPLUS_BOLD = require('../assets/fonts/MPLUS1p-Bold.ttf');
const RUBIK_REGULAR = require('../assets/fonts/Rubik-Regular.ttf');
const RUBIK_BOLD = require('../assets/fonts/Rubik-Bold.ttf');

const KOREAN_NATIVE_FONTS = {
	Pretendard: PRETENDARD_REGULAR,
	'Pretendard-Thin': PRETENDARD_REGULAR,
	'Pretendard-ExtraLight': PRETENDARD_REGULAR,
	'Pretendard-Light': PRETENDARD_REGULAR,
	'Pretendard-Regular': PRETENDARD_REGULAR,
	'Pretendard-Medium': PRETENDARD_MEDIUM,
	'Pretendard-SemiBold': PRETENDARD_SEMIBOLD,
	'Pretendard-Bold': PRETENDARD_BOLD,
	'Pretendard-ExtraBold': PRETENDARD_EXTRABOLD,
	'Pretendard-Black': PRETENDARD_EXTRABOLD,
	Rubik: RUBIK_REGULAR,
	'Rubik-Bold': RUBIK_BOLD,
};

const JAPANESE_NATIVE_FONTS = {
	Pretendard: MPLUS_REGULAR,
	'Pretendard-Thin': MPLUS_REGULAR,
	'Pretendard-ExtraLight': MPLUS_REGULAR,
	'Pretendard-Light': MPLUS_REGULAR,
	'Pretendard-Regular': MPLUS_REGULAR,
	'Pretendard-Medium': MPLUS_MEDIUM,
	'Pretendard-SemiBold': MPLUS_BOLD,
	'Pretendard-Bold': MPLUS_BOLD,
	'Pretendard-ExtraBold': MPLUS_BOLD,
	'Pretendard-Black': MPLUS_BOLD,
	'MPLUS1p-Thin': MPLUS_REGULAR,
	'MPLUS1p-Light': MPLUS_REGULAR,
	'MPLUS1p-Regular': MPLUS_REGULAR,
	'MPLUS1p-Medium': MPLUS_MEDIUM,
	'MPLUS1p-Bold': MPLUS_BOLD,
	'MPLUS1p-ExtraBold': MPLUS_BOLD,
	'MPLUS1p-Black': MPLUS_BOLD,
	Rubik: RUBIK_REGULAR,
	'Rubik-Bold': RUBIK_BOLD,
};

export default Sentry.wrap(function RootLayout() {
	const navigationRef = useNavigationContainerRef();

	useEffect(() => {
		if (navigationRef && navigationIntegration) {
			navigationIntegration.registerNavigationContainer(navigationRef);
		}
	}, [navigationRef]);

	const { request: requestAtt } = useAtt();
	const notificationListener = useRef<{ remove(): void } | null>(null);
	const responseListener = useRef<{ remove(): void } | null>(null);
	const processedNotificationIds = useRef<Set<string>>(new Set());

	const [coldStartProcessed, setColdStartProcessed] = useState(false);

	useEffect(() => {
		const SDK_INIT_TIMEOUT_MS = 10000;

		const initializeSDKs = async () => {
			try {
				console.log('[SDK Init] Starting SDK initialization sequence...');

				const kakaoInitPromise = initializeKakaoSDK('4d405583bea731b1c4fb26eb8a14e894', {
					web: {
						javascriptKey: '2356db85eb35f5f941d0d66178e16b4e',
						restApiKey: '228e892bfc0e42e824d592d92f52e72e',
					},
				});

				const timeoutPromise = new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Kakao SDK init timeout')), SDK_INIT_TIMEOUT_MS),
				);

				try {
					await Promise.race([kakaoInitPromise, timeoutPromise]);
					console.log('[SDK Init] Kakao SDK initialized');
				} catch (kakaoError) {
					console.warn('[SDK Init] Kakao SDK init failed or timed out:', kakaoError);
				}

				// Android 키 해시 확인 (개발 모드에서만)
				if (Platform.OS === 'android' && __DEV__) {
					try {
						const keyHash = await getKeyHashAndroid();
						console.log('🔑 [Android Key Hash]', keyHash);
						Alert.alert(
							'Android Key Hash',
							i18n.t('apps.root.android_key_hash_message', { keyHash }),
							[
								{ text: i18n.t('apps.root.confirm'), style: 'default' },
								{
									text: i18n.t('apps.root.view_in_console'),
									onPress: () => console.log('🔑 Key Hash:', keyHash),
								},
							],
						);
					} catch (error) {
						console.error('🔑 [Android Key Hash] 확인 실패:', error);
					}
				}

				const mixpanelToken = env.MIXPANEL_TOKEN;
				if (mixpanelToken && !__DEV__) {
					try {
						mixpanelAdapter.init(mixpanelToken, true);

						// Super Properties 등록: 국가별 지표 분리
						const country = getCountryFromLocale();
						mixpanelAdapter.registerSuperProperties({ country });
						console.log('[SDK Init] Mixpanel initialized with country:', country);
					} catch (mixpanelError) {
						console.warn('[SDK Init] Mixpanel init failed:', mixpanelError);
					}
				} else if (__DEV__) {
					console.log('[SDK Init] Mixpanel disabled in development mode');
				}

				console.log('[SDK Init] All SDKs initialized successfully');
			} catch (error) {
				console.error('[SDK Init] SDK 초기화 실패:', error);
			}
		};

		initializeSDKs();
	}, []);

	const nativeFonts = useMemo<Record<string, number>>(() => {
		if (Platform.OS === 'web') {
			return {};
		}

		const isJapaneseLocale = getUserLanguage() === 'ja';
		return isJapaneseLocale ? JAPANESE_NATIVE_FONTS : KOREAN_NATIVE_FONTS;
	}, []);
	const [fontsLoaded] = useFonts(nativeFonts);
	const loaded = Platform.OS === 'web' ? true : fontsLoaded;
	const [forceReady, setForceReady] = useState(false);

	useEffect(() => {
		if (Platform.OS === 'web') return;

		const MAX_SPLASH_TIMEOUT_MS = 15000;
		const timeoutId = setTimeout(() => {
			console.warn('[Splash] Force hiding after timeout - something may have failed');
			setForceReady(true);
		}, MAX_SPLASH_TIMEOUT_MS);

		return () => clearTimeout(timeoutId);
	}, []);

	const isReady = loaded || forceReady;

	useEffect(() => {
		if (!isReady) {
			return;
		}

		if (Platform.OS === 'web') {
			console.log('[Splash] web platform -> no native splash');
			return;
		}

		const hideSplashScreen = async () => {
			const elapsed = Date.now() - START_AT;
			const remain = Math.max(0, MIN_SPLASH_MS - elapsed);
			console.log('[Splash] elapsed:', elapsed, 'remain:', remain, 'forceReady:', forceReady);

			await new Promise((resolve) => setTimeout(resolve, remain));
			await SplashScreen.hideAsync().catch((e) => console.log('[Splash] hide ERR', e));
		};

		hideSplashScreen();
	}, [isReady, forceReady]);

	useEffect(() => {
		requestAtt();
	}, [requestAtt]);

	// i18n 언어 변경 감지 시 Mixpanel country Super Property 업데이트
	useEffect(() => {
		const handleLanguageChange = () => {
			const country = getCountryFromLocale();
			mixpanelAdapter.registerSuperProperties({ country });
			console.log('[i18n] Language changed, updated country:', country);
		};

		i18n.on('languageChanged', handleLanguageChange);

		return () => {
			i18n.off('languageChanged', handleLanguageChange);
		};
	}, []);

	// Web: AsyncRequireError 처리 (배포 중 캐시 불일치 문제 해결)
	useEffect(() => {
		if (Platform.OS !== 'web') return;

		const RELOAD_KEY = 'async-error-reload-count';
		const MAX_RELOAD_ATTEMPTS = 2;
		const RELOAD_RESET_TIME = 60000; // 1분

		const handleAsyncRequireError = (event: ErrorEvent) => {
			const error = event.error;
			const message = event.message || error?.message || '';

			// AsyncRequireError 감지
			if (message.includes('AsyncRequireError') || message.includes('Loading module')) {
				event.preventDefault();

				// Sentry에 상세 로그
				Sentry.captureException(error, {
					tags: {
						error_type: 'async_require_error',
						platform: 'web',
					},
					contexts: {
						async_error: {
							message,
							url: window.location.href,
							timestamp: new Date().toISOString(),
						},
					},
				});

				// 무한 리로드 방지
				const now = Date.now();
				const stored = sessionStorage.getItem(RELOAD_KEY);
				const reloadData = stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };

				// 1분 이상 지났으면 카운터 리셋
				if (now - reloadData.lastAttempt > RELOAD_RESET_TIME) {
					reloadData.count = 0;
				}

				if (reloadData.count < MAX_RELOAD_ATTEMPTS) {
					reloadData.count += 1;
					reloadData.lastAttempt = now;
					sessionStorage.setItem(RELOAD_KEY, JSON.stringify(reloadData));

					console.warn('[AsyncRequireError] 새 버전이 배포되었습니다. 페이지를 새로고침합니다...');

					// 짧은 딜레이 후 리로드 (Toast 표시를 위해)
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				} else {
					console.error('[AsyncRequireError] 최대 리로드 횟수 초과. 수동 새로고침이 필요합니다.');

					// 최대 재시도 초과 시 사용자에게 알림
					if (typeof alert !== 'undefined') {
						alert(i18n.t('apps.root.app_updated_please_refresh'));
					}
				}
			}
		};

		window.addEventListener('error', handleAsyncRequireError);

		return () => {
			window.removeEventListener('error', handleAsyncRequireError);
		};
	}, []);

	const isValidNotificationData = useCallback((data: unknown): data is NotificationData => {
		if (!data || typeof data !== 'object') return false;

		const obj = data as Record<string, unknown>;
		return (
			typeof obj.type === 'string' && (NOTIFICATION_TYPES as readonly string[]).includes(obj.type)
		);
	}, []);

	useEffect(() => {
		if (!loaded) return;

		if (Platform.OS === 'web') {
			setColdStartProcessed(true);
			return;
		}

		const handleColdStartNotification = () => {
			try {
				const lastNotificationResponse = Notifications.getLastNotificationResponse();

				if (lastNotificationResponse?.notification) {
					const notificationId = lastNotificationResponse.notification.request.identifier;
					const rawData = lastNotificationResponse.notification.request.content.data;

					if (!processedNotificationIds.current.has(notificationId)) {
						if (isValidNotificationData(rawData)) {
							processedNotificationIds.current.add(notificationId);
							Notifications.clearLastNotificationResponse();

							setTimeout(() => {
								handleNotificationTap(rawData as NotificationData, router);
							}, 500);
						}
					}
				}
			} catch (error) {
				console.error('콜드 스타트 알림 처리 중 오류:', error);
			} finally {
				setColdStartProcessed(true);
			}
		};

		handleColdStartNotification();
	}, [loaded, isValidNotificationData]);

	useEffect(() => {
		if (!loaded || !coldStartProcessed || Platform.OS === 'web') return;

		notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
			console.log('알림 수신:', notification);

			const data = notification.request.content.data;
			if (data?.type === 'profile_image_approved' || data?.type === 'profile_image_rejected') {
				eventBus.emit('photo-review:result', {
					reviewStatus: data.type === 'profile_image_approved' ? 'approved' : 'rejected',
					rejectionReason: data.reason,
				});
			}
		});

		responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
			const notificationId = response.notification.request.identifier;
			const rawData = response.notification.request.content.data;

			if (processedNotificationIds.current.has(notificationId)) {
				return;
			}

			try {
				if (isValidNotificationData(rawData)) {
					processedNotificationIds.current.add(notificationId);
					handleNotificationTap(rawData as NotificationData, router);
				} else {
					router.push('/home');
				}
			} catch (error) {
				router.push('/home');
			}
		});

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove();
			}
			if (responseListener.current) {
				responseListener.current.remove();
			}
		};
	}, [loaded, coldStartProcessed, isValidNotificationData]);

	if (!isReady) {
		return null;
	}

	return (
		<GestureHandlerRootView style={styles.rootView}>
			<LoggerContainer>
				<QueryProvider>
					<ModalProvider>
						<I18nextProvider i18n={i18n}>
							<GlobalChatProvider>
								<View style={styles.container}>
									<PortalProvider>
										<AnalyticsProvider>
											<RouteTracker>
												<>
													<Slot />
													<OTAUpdateHandler />
													<VersionUpdateChecker />
													<Toast />
													<ChatActivityTracker />
													<SessionTracker />
													<AppBadgeSync />
													<LoginRequiredModalListener />
													<ServerMaintenanceListener />
													<PhotoReviewModalListener />
													<GlobalLoadingOverlay />
												</>
											</RouteTracker>
										</AnalyticsProvider>
									</PortalProvider>
								</View>
							</GlobalChatProvider>
						</I18nextProvider>
					</ModalProvider>
				</QueryProvider>
			</LoggerContainer>
		</GestureHandlerRootView>
	);
});

const webFullHeight = { height: '100dvh' } as unknown as ViewStyle;

const styles = StyleSheet.create<{ rootView: ViewStyle; container: ViewStyle }>({
	rootView: {
		flex: 1,
		...Platform.select({
			web: webFullHeight,
		}),
	},
	container: {
		flex: 1,
		...Platform.select({
			web: {
				maxWidth: 468,
				width: '100%',
				...webFullHeight,
				alignSelf: 'center',
				overflow: 'hidden',
			},
		}),
	},
});
