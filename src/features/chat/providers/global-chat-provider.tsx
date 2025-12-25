import { useEffect, useRef, useCallback, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../../auth";
import { chatEventBus } from "../services/chat-event-bus";
import { initializeChatModules, cleanupChatModules } from "../services/init-chat-modules";
import { socketConnectionManager } from "../services/socket-event-manager";
import { env } from "@/src/shared/libs/env";

export const GlobalChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, tokenLoading } = useAuth();
  const isModuleInitialized = useRef(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);

  // 지수 백오프 계산: 2초 → 4초 → 8초 → 16초 (최대 30초)
  const calculateBackoffDelay = useCallback((attempts: number): number => {
    const baseDelay = 2000; // 2초
    const maxDelay = 30000; // 30초
    const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
    console.log(`[GlobalChatProvider] Backoff delay: ${delay}ms (attempt ${attempts + 1})`);
    return delay;
  }, []);

  // 소켓 연결 시도 함수
  const attemptConnection = useCallback((token: string, reason: string) => {
    console.log(`[GlobalChatProvider] Attempting connection (${reason})...`);
    console.log('[GlobalChatProvider] Current socket state:', {
      isConnected: socketConnectionManager.isConnected,
      isModuleInitialized: socketConnectionManager.isModuleInitialized,
      networkAvailable: isNetworkAvailable,
    });

    // 네트워크가 없으면 건너뛰기
    if (!isNetworkAvailable) {
      console.log('[GlobalChatProvider] Network unavailable, skipping connection...');
      return;
    }

    // 이미 연결되어 있으면 건너뛰기
    if (socketConnectionManager.isConnected) {
      console.log('[GlobalChatProvider] Socket already connected, skipping...');
      reconnectAttempts.current = 0; // 연결 성공 시 재시도 카운터 리셋
      return;
    }

    console.log('[GlobalChatProvider] Emitting CONNECTION_REQUESTED event...');
    chatEventBus.emit({
      type: "CONNECTION_REQUESTED",
      payload: {
        url: env.SERVER_URL,
        token,
      },
    });
  }, [isNetworkAvailable]);

  // 모듈 초기화 (한 번만)
  useEffect(() => {
    if (isModuleInitialized.current) {
      console.log('[GlobalChatProvider] Modules already initialized, skipping...');
      return;
    }

    console.log('[GlobalChatProvider] Initializing chat modules...');
    initializeChatModules();
    isModuleInitialized.current = true;

    return () => {
      console.log('[GlobalChatProvider] Cleaning up chat modules...');
      cleanupChatModules();
      isModuleInitialized.current = false;
    };
  }, []);

  // 토큰 로드 완료 시 초기 연결
  useEffect(() => {
    console.log('[GlobalChatProvider] Auth state changed:', {
      tokenLoading,
      hasToken: !!accessToken,
      isModuleInitialized: socketConnectionManager.isModuleInitialized,
    });

    if (tokenLoading) {
      console.log('[GlobalChatProvider] Token still loading, waiting...');
      return;
    }

    if (!accessToken) {
      console.log('[GlobalChatProvider] No accessToken after loading, skipping socket connection');
      return;
    }

    if (!socketConnectionManager.isModuleInitialized) {
      console.log('[GlobalChatProvider] Chat modules not initialized yet, waiting...');
      return;
    }

    attemptConnection(accessToken, 'initial auth');
  }, [accessToken, tokenLoading, attemptConnection]);

  // 네트워크 상태 감지
  useEffect(() => {
    console.log('[GlobalChatProvider] Setting up network state listener...');

    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('[GlobalChatProvider] Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      const networkAvailable = state.isConnected === true && state.isInternetReachable !== false;
      setIsNetworkAvailable(networkAvailable);

      // 네트워크가 복구되면 즉시 재연결 시도
      if (networkAvailable && !socketConnectionManager.isConnected && accessToken && !tokenLoading) {
        console.log('[GlobalChatProvider] Network restored, attempting immediate reconnect...');
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
  }, [accessToken, tokenLoading, attemptConnection]);

  // 소켓 연결 끊김 감지 및 자동 재연결 (지수 백오프 적용)
  useEffect(() => {
    console.log('[GlobalChatProvider] Setting up socket disconnect listener...');

    const unsubscribeDisconnect = chatEventBus.on('SOCKET_DISCONNECTED').subscribe(({ payload }) => {
      console.log('[GlobalChatProvider] Socket disconnected:', payload.reason);

      // 토큰이 있고 로딩 중이 아니면 재연결 시도
      if (accessToken && !tokenLoading && socketConnectionManager.isModuleInitialized && isNetworkAvailable) {
        const delay = calculateBackoffDelay(reconnectAttempts.current);
        console.log(`[GlobalChatProvider] Scheduling auto-reconnect in ${delay}ms...`);

        // 기존 타임아웃 취소
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          attemptConnection(accessToken, 'auto-reconnect after disconnect');
          reconnectTimeoutRef.current = null;
        }, delay);
      } else {
        console.log('[GlobalChatProvider] Skipping auto-reconnect:', {
          hasToken: !!accessToken,
          tokenLoading,
          isModuleInitialized: socketConnectionManager.isModuleInitialized,
          networkAvailable: isNetworkAvailable,
        });
      }
    });

    const unsubscribeConnected = chatEventBus.on('SOCKET_CONNECTED').subscribe(() => {
      console.log('[GlobalChatProvider] Socket connected successfully');
      reconnectAttempts.current = 0; // 연결 성공 시 재시도 카운터 리셋

      // 기존 타임아웃 취소
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    const unsubscribeReconnectFailed = chatEventBus.on('SOCKET_RECONNECT_FAILED').subscribe(({ payload }) => {
      console.log('[GlobalChatProvider] Socket reconnect failed:', payload.error);

      // 최대 재연결 실패 시 지수 백오프로 재시도
      if (accessToken && !tokenLoading && socketConnectionManager.isModuleInitialized && isNetworkAvailable) {
        const delay = calculateBackoffDelay(reconnectAttempts.current);
        console.log(`[GlobalChatProvider] Scheduling reconnect after failure in ${delay}ms...`);

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

    return () => {
      unsubscribeDisconnect.unsubscribe();
      unsubscribeConnected.unsubscribe();
      unsubscribeReconnectFailed.unsubscribe();

      // cleanup 시 타임아웃 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [accessToken, tokenLoading, attemptConnection, calculateBackoffDelay, isNetworkAvailable]);

  return <>{children}</>;
};
