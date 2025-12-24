import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { chatEventBus } from '../services/chat-event-bus';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

function ConnectionStatusBanner() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [slideAnim] = useState(new Animated.Value(-60));
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connectedSub = chatEventBus.on('SOCKET_CONNECTED').subscribe(() => {
      setStatus('connected');
      setReconnectAttempt(0);
      setCountdown(0);

      // 카운트다운 정리
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    });

    const disconnectedSub = chatEventBus.on('SOCKET_DISCONNECTED').subscribe(() => {
      setStatus('disconnected');
    });

    const reconnectingSub = chatEventBus.on('SOCKET_RECONNECTING').subscribe(({ payload }) => {
      setStatus('reconnecting');
      setReconnectAttempt(payload.attempt || 0);

      // 지수 백오프 딜레이 계산 (GlobalChatProvider와 동일)
      const baseDelay = 2000;
      const maxDelay = 30000;
      const delay = Math.min(baseDelay * Math.pow(2, (payload.attempt || 1) - 1), maxDelay);
      setCountdown(Math.ceil(delay / 1000));

      // 카운트다운 시작
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    const reconnectedSub = chatEventBus.on('SOCKET_RECONNECTED').subscribe(() => {
      setStatus('connected');
      setReconnectAttempt(0);
      setCountdown(0);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    });

    const reconnectFailedSub = chatEventBus.on('SOCKET_RECONNECT_FAILED').subscribe(() => {
      setStatus('disconnected');
    });

    return () => {
      connectedSub.unsubscribe();
      disconnectedSub.unsubscribe();
      reconnectingSub.unsubscribe();
      reconnectedSub.unsubscribe();
      reconnectFailedSub.unsubscribe();

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      // 연결되면 배너를 위로 슬라이드
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (status === 'disconnected') {
      // 연결 끊김이면 배너를 아래로 슬라이드
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // reconnecting 상태일 때는 배너를 숨기고 모달을 띄움
  }, [status, slideAnim]);

  const getBannerConfig = () => {
    if (status === 'disconnected') {
      return {
        backgroundColor: '#FF3B30',
        text: '연결이 끊겼습니다',
        icon: '⚠️',
      };
    }
    return {
      backgroundColor: '#34C759',
      text: '연결됨',
      icon: '✓',
    };
  };

  const config = getBannerConfig();

  return (
    <>
      {/* 재연결 중 모달 */}
      <Modal
        visible={status === 'reconnecting'}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#7A4AE1" />
            <Text style={styles.modalTitle}>다시 연결하고 있어요</Text>
            {reconnectAttempt > 0 && (
              <Text style={styles.modalAttempt}>
                재시도 {reconnectAttempt}회
              </Text>
            )}
            {countdown > 0 ? (
              <Text style={styles.modalSubtitle}>
                {countdown}초 후 다시 시도합니다
              </Text>
            ) : (
              <Text style={styles.modalSubtitle}>잠시만 기다려주세요</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* 연결 끊김 배너 */}
      {status !== 'reconnecting' && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: config.backgroundColor,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={styles.text}>{config.text}</Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: semanticColors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Pretendard-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Pretendard-SemiBold',
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  modalAttempt: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Pretendard-Medium',
    color: '#7A4AE1',
    textAlign: 'center',
    backgroundColor: '#F7F3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default ConnectionStatusBanner;
