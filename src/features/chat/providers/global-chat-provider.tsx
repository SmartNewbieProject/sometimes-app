import { env } from '@/src/shared/libs/env';
import { devLogWithTag } from '@/src/shared/utils';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '../../auth';
import { chatEventBus } from '../services/chat-event-bus';
import { cleanupChatModules, initializeChatModules } from '../services/init-chat-modules';
import { socketConnectionManager } from '../services/socket-event-manager';

export const GlobalChatProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const log = useCallback((...args: unknown[]) => {
		devLogWithTag('GlobalChatProvider', ...args);
	}, []);
	const { accessToken, tokenLoading } = useAuth();
	const queryClient = useQueryClient();
	const isModuleInitialized = useRef(false);
	const reconnectAttempts = useRef(0);
	const hasConnectedOnce = useRef(false);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const backgroundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const backgroundStartTime = useRef<number | null>(null);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);

	// 백그라운드 타임아웃 상수 (30초)
	const BACKGROUND_DISCONNECT_DELAY = 30000;

	// 지수 백오프 계산: 2초 → 4초 → 8초 → 16초 (최대 30초)
	const calculateBackoffDelay = useCallback(
		(attempts: number): number => {
			const baseDelay = 2000; // 2초
			const maxDelay = 30000; // 30초
			const delay = Math.min(baseDelay * 2 ** attempts, maxDelay);
			log(`Backoff delay: ${delay}ms (attempt ${attempts + 1})`);
			return delay;
		},
		[log],
	);

	// 소켓 연결 시도 함수
	const attemptConnection = useCallback(
		(token: string, reason: string) => {
			log(`Attempting connection (${reason})...`);
			log('Current socket state:', {
				isConnected: socketConnectionManager.isConnected,
				isModuleInitialized: socketConnectionManager.isModuleInitialized,
				networkAvailable: isNetworkAvailable,
			});

			// 네트워크가 없으면 건너뛰기
			if (!isNetworkAvailable) {
				log('Network unavailable, skipping connection...');
				return;
			}

			// 이미 연결되어 있으면 건너뛰기
			if (socketConnectionManager.isConnected) {
				log('Socket already connected, skipping...');
				reconnectAttempts.current = 0; // 연결 성공 시 재시도 카운터 리셋
				return;
			}

			log('Emitting CONNECTION_REQUESTED event...');
			chatEventBus.emit({
				type: 'CONNECTION_REQUESTED',
				payload: {
					url: env.SERVER_URL,
					token,
				},
			});
		},
		[isNetworkAvailable, log],
	);

	// 모듈 초기화 (한 번만)
	useEffect(() => {
		if (isModuleInitialized.current) {
			log('Modules already initialized, skipping...');
			return;
		}

		log('Initializing chat modules...');
		initializeChatModules();
		isModuleInitialized.current = true;

		return () => {
			log('Cleaning up chat modules...');
			cleanupChatModules();
			isModuleInitialized.current = false;
		};
	}, [log]);

	// 토큰 로드 완료 시 초기 연결
	useEffect(() => {
		log('Auth state changed:', {
			tokenLoading,
			hasToken: !!accessToken,
			isModuleInitialized: socketConnectionManager.isModuleInitialized,
		});

		if (tokenLoading) {
			log('Token still loading, waiting...');
			return;
		}

		if (!accessToken) {
			log('No accessToken after loading, skipping socket connection');
			return;
		}

		if (!socketConnectionManager.isModuleInitialized) {
			log('Chat modules not initialized yet, waiting...');
			return;
		}

		attemptConnection(accessToken, 'initial auth');
	}, [accessToken, tokenLoading, attemptConnection, log]);

	// 네트워크 상태 감지
	useEffect(() => {
		log('Setting up network state listener...');

		const unsubscribe = NetInfo.addEventListener((state) => {
			log('Network state changed:', {
				isConnected: state.isConnected,
				isInternetReachable: state.isInternetReachable,
				type: state.type,
			});

			const networkAvailable = state.isConnected === true && state.isInternetReachable !== false;
			setIsNetworkAvailable(networkAvailable);

			// 네트워크가 복구되면 즉시 재연결 시도
			if (
				networkAvailable &&
				!socketConnectionManager.isConnected &&
				accessToken &&
				!tokenLoading
			) {
				log('Network restored, attempting immediate reconnect...');
				reconnectAttempts.current = 0; // 네트워크 복구 시 카운터 리셋

				// 기존 타임아웃 취소
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
					reconnectTimeoutRef.current = null;
				}

				attemptConnection(accessToken, 'network restored');
			}
		});

		return () => {
			unsubscribe();
		};
	}, [accessToken, tokenLoading, attemptConnection, log]);

	// AppState 감지: 백그라운드 진입 시 30초 후 disconnect, 포그라운드 복귀 시 재연결
	useEffect(() => {
		log('Setting up AppState listener...');

		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			const previousState = appStateRef.current;
			appStateRef.current = nextAppState;

			log(`AppState changed: ${previousState} -> ${nextAppState}`);

			// 앱 이벤트 emit
			chatEventBus.emit({
				type: 'APP_STATE_CHANGED',
				payload: { state: nextAppState },
			});

			// 백그라운드로 진입
			if (nextAppState === 'background' && previousState === 'active') {
				log('App entering background, starting disconnect timer...');
				backgroundStartTime.current = Date.now();

				// 기존 백그라운드 타임아웃 취소
				if (backgroundTimeoutRef.current) {
					clearTimeout(backgroundTimeoutRef.current);
				}

				// 30초 후 소켓 연결 해제
				backgroundTimeoutRef.current = setTimeout(() => {
					log('Background timeout reached, disconnecting socket...');
					chatEventBus.emit({
						type: 'SOCKET_DISCONNECTED',
						payload: { reason: 'app_background_timeout' },
					});
					backgroundTimeoutRef.current = null;
				}, BACKGROUND_DISCONNECT_DELAY);
			}

			// 포그라운드로 복귀
			if (nextAppState === 'active' && previousState !== 'active') {
				log('App returning to foreground...');

				// 백그라운드 타임아웃 취소
				if (backgroundTimeoutRef.current) {
					clearTimeout(backgroundTimeoutRef.current);
					backgroundTimeoutRef.current = null;
					log('Background disconnect timer cancelled');
				}

				// 백그라운드 체류 시간 로그
				if (backgroundStartTime.current) {
					const duration = Date.now() - backgroundStartTime.current;
					log(`Background duration: ${duration}ms`);
					backgroundStartTime.current = null;
				}

				// 재시도 카운터 리셋
				reconnectAttempts.current = 0;

				// 연결 상태 체크 후 필요시 재연결
				if (
					accessToken &&
					!tokenLoading &&
					socketConnectionManager.isModuleInitialized &&
					isNetworkAvailable
				) {
					if (!socketConnectionManager.isConnected) {
						log('Socket disconnected while in background, reconnecting...');
						attemptConnection(accessToken, 'foreground resume');
					} else {
						log('Socket still connected after foreground resume');
					}
				}
			}
		};

		const subscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			subscription.remove();
			// 백그라운드 타임아웃 정리
			if (backgroundTimeoutRef.current) {
				clearTimeout(backgroundTimeoutRef.current);
				backgroundTimeoutRef.current = null;
			}
		};
	}, [accessToken, tokenLoading, attemptConnection, isNetworkAvailable, log]);

	// 소켓 연결 끊김 감지 및 자동 재연결 (지수 백오프 적용)
	useEffect(() => {
		log('Setting up socket disconnect listener...');

		const unsubscribeDisconnect = chatEventBus
			.on('SOCKET_DISCONNECTED')
			.subscribe(({ payload }) => {
				log('Socket disconnected:', payload.reason);

				// Socket.IO 내장 재연결이 처리하는 일반적인 disconnect는 개입하지 않음
				// 특정 상황에서만 GlobalChatProvider가 직접 재연결 시도:
				// - app_background_timeout: 백그라운드 타임아웃으로 앱에서 직접 disconnect
				// - server_session_closed: 서버 세션 종료 (새 연결 필요)
				// - io server disconnect: 서버가 강제 disconnect (새 연결 필요)
				const manualReconnectReasons = [
					'app_background_timeout',
					'server_session_closed',
					'io server disconnect',
				];

				const shouldManualReconnect =
					payload.reason && manualReconnectReasons.includes(payload.reason);

				if (!shouldManualReconnect) {
					log('Delegating reconnection to Socket.IO internal mechanism');
					return;
				}

				// 수동 재연결이 필요한 경우에만 처리
				if (
					accessToken &&
					!tokenLoading &&
					socketConnectionManager.isModuleInitialized &&
					isNetworkAvailable
				) {
					const delay = calculateBackoffDelay(reconnectAttempts.current);
					log(`Manual reconnect needed (${payload.reason}), scheduling in ${delay}ms...`);

					// 기존 타임아웃 취소
					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
					}

					reconnectTimeoutRef.current = setTimeout(() => {
						reconnectAttempts.current += 1;
						attemptConnection(accessToken, `manual-reconnect: ${payload.reason}`);
						reconnectTimeoutRef.current = null;
					}, delay);
				} else {
					log('Skipping manual reconnect:', {
						hasToken: !!accessToken,
						tokenLoading,
						isModuleInitialized: socketConnectionManager.isModuleInitialized,
						networkAvailable: isNetworkAvailable,
					});
				}
			});

		const unsubscribeConnected = chatEventBus.on('SOCKET_CONNECTED').subscribe(() => {
			log('Socket connected successfully');
			reconnectAttempts.current = 0; // 연결 성공 시 재시도 카운터 리셋

			const isReconnect = hasConnectedOnce.current;
			hasConnectedOnce.current = true;

			if (isReconnect) {
				log('Resyncing active chat queries after reconnect...');
				void queryClient.invalidateQueries({
					queryKey: ['chat-room'],
					refetchType: 'active',
				});
				void queryClient.invalidateQueries({
					predicate: (query) => {
						const key = query.queryKey[0];
						return key === 'chat-list' || key === 'chat-detail';
					},
					refetchType: 'active',
				});
			}

			// 기존 타임아웃 취소
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		});

		const unsubscribeTokenUpdated = chatEventBus.on('TOKEN_UPDATED').subscribe(({ payload }) => {
			log('Token updated, attempting connection...');
			if (payload.token && socketConnectionManager.isModuleInitialized && isNetworkAvailable) {
				reconnectAttempts.current = 0;
				attemptConnection(payload.token, 'token updated after login');
			}
		});

		const unsubscribeReconnectFailed = chatEventBus
			.on('SOCKET_RECONNECT_FAILED')
			.subscribe(({ payload }) => {
				log('Socket reconnect failed:', payload.error);

				// 최대 재연결 실패 시 지수 백오프로 재시도
				if (
					accessToken &&
					!tokenLoading &&
					socketConnectionManager.isModuleInitialized &&
					isNetworkAvailable
				) {
					const delay = calculateBackoffDelay(reconnectAttempts.current);
					log(`Scheduling reconnect after failure in ${delay}ms...`);

					// 기존 타임아웃 취소
					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
					}

					reconnectTimeoutRef.current = setTimeout(() => {
						reconnectAttempts.current += 1;
						attemptConnection(accessToken, 'retry after reconnect failure');
						reconnectTimeoutRef.current = null;
					}, delay);
				}
			});

		// 소켓이 null일 때 새 연결 필요 이벤트 처리
		const unsubscribeConnectionNeeded = chatEventBus
			.on('SOCKET_CONNECTION_NEEDED')
			.subscribe(() => {
				log('Socket connection needed (socket is null)');

				if (
					accessToken &&
					!tokenLoading &&
					socketConnectionManager.isModuleInitialized &&
					isNetworkAvailable
				) {
					// 기존 타임아웃 취소
					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
						reconnectTimeoutRef.current = null;
					}

					// 즉시 새 연결 시도 (백오프 없이)
					log('Immediately attempting new connection...');
					reconnectAttempts.current = 0; // 새 연결 시도 시 카운터 리셋
					attemptConnection(accessToken, 'socket was null - creating new connection');
				} else {
					log('Cannot create new connection:', {
						hasToken: !!accessToken,
						tokenLoading,
						isModuleInitialized: socketConnectionManager.isModuleInitialized,
						networkAvailable: isNetworkAvailable,
					});
				}
			});

		const unsubscribeHealthCheckFailed = chatEventBus
			.on('SOCKET_HEALTH_CHECK_FAILED')
			.subscribe(({ payload }) => {
				log('Socket health check failed, last activity:', payload.lastActivity);
				if (
					accessToken &&
					!tokenLoading &&
					socketConnectionManager.isModuleInitialized &&
					isNetworkAvailable
				) {
					reconnectAttempts.current = 0;
					attemptConnection(accessToken, 'health check failed - ghost connection');
				}
			});

		return () => {
			unsubscribeDisconnect.unsubscribe();
			unsubscribeConnected.unsubscribe();
			unsubscribeReconnectFailed.unsubscribe();
			unsubscribeTokenUpdated.unsubscribe();
			unsubscribeConnectionNeeded.unsubscribe();
			unsubscribeHealthCheckFailed.unsubscribe();

			// cleanup 시 타임아웃 정리
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		};
	}, [
		accessToken,
		tokenLoading,
		attemptConnection,
		calculateBackoffDelay,
		isNetworkAvailable,
		log,
		queryClient,
	]);

	return <>{children}</>;
};
