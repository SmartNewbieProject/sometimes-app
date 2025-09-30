import { useEffect, useRef, useState } from "react";
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// 전체 칸 숫자
const NUMBER_OF_SLICES = 12;

// 룰렛이 돌아가는 최소 시간 보장을 위해서
const MIN_SPIN_DURATION = 3000;
// 백엔드에서 값을 결정해주고 나서 멈추기 까지 여유 시간
const SETTLE_DURATION = 1500;

// 타임아웃(이건 실제 코드 연결 시 뺄 예정)
const API_TIMEOUT = 5000;

// 피그마에 있던 순서대로 0은 꽝
const PRIZE_MAP = [1, 0, 2, 0, 1, 0, 3, 0, 4, 0, 5, 0];

const mockApiCall = (shouldFail = false) => {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 4000 + 500;

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("API 요청 실패"));
      } else {
        const resultIndex = Math.floor(Math.random() * 6);
        resolve(resultIndex);
      }
    }, delay);
  });
};

export function useRoulette() {
  const rouletteValue = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minTimeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (minTimeTimeoutRef.current) {
        clearTimeout(minTimeTimeoutRef.current);
      }
      cancelAnimation(rouletteValue);
    };
  }, []);

  // 룰렛을 멈출 때 사용
  const settleRoulette = (prizeValue: number) => {
    // 전달받은 결과 값과 일치하는 칸을 담을 배열
    const possibleIndices: number[] = [];
    console.log("value", prizeValue);
    // 일치하는 칸들을 담음
    PRIZE_MAP.forEach((value, index) => {
      if (value === prizeValue) {
        possibleIndices.push(index);
      }
    });

    // 이건 그냥 목표 칸들 중 어떤 칸에 멈출지(랜덤으로 함)
    const finalIndex =
      possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

    // 칸 별 deg
    const sliceAngle = 360 / NUMBER_OF_SLICES;

    // 목표하는 칸의 각도(- 넣어준건 해당 칸의 각도를 0deg위치에 위치 시켜야해서 )
    const targetAngleForSlice = -sliceAngle * finalIndex;

    // 안전 거리
    const fullSpins = 2;

    const finalTargetAngle =
      360 * fullSpins + // 추가로 돌 바퀴수 (예: +720°)
      targetAngleForSlice; // 목표 칸 각도 (예: -60°)

    rouletteValue.value = withTiming(
      finalTargetAngle,
      {
        duration: SETTLE_DURATION,
        easing: Easing.out(Easing.cubic),
      },
      (isFinished) => {
        if (isFinished) {
          runOnJS(setIsSpinning)(false);
        }
      }
    );
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const startSpin = (apiCall: any) => {
    if (isSpinning) return;

    // 기존 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (minTimeTimeoutRef.current) {
      clearTimeout(minTimeTimeoutRef.current);
      minTimeTimeoutRef.current = null;
    }

    setIsSpinning(true);
    rouletteValue.value = 0;

    rouletteValue.value = withRepeat(
      withTiming(360, { duration: 500, easing: Easing.linear }),
      -1
    );

    const minTimePromise = new Promise<void>((resolve) => {
      minTimeTimeoutRef.current = setTimeout(() => {
        minTimeTimeoutRef.current = null;
        resolve();
      }, MIN_SPIN_DURATION);
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        reject(new Error("API 응답 시간 초과"));
      }, API_TIMEOUT);
    });

    const apiPromise = Promise.race([apiCall, timeoutPromise]);

    Promise.all([apiPromise, minTimePromise])
      .then(([resultIndex]) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        cancelAnimation(rouletteValue);
        runOnJS(settleRoulette)(resultIndex);
      })
      .catch((error) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (minTimeTimeoutRef.current) {
          clearTimeout(minTimeTimeoutRef.current);
          minTimeTimeoutRef.current = null;
        }

        cancelAnimation(rouletteValue);
        runOnJS(setIsSpinning)(false);
      });
  };

  const handleStart = () => {
    startSpin(mockApiCall(false));
  };

  const rouletteAnimationStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${rouletteValue.value}deg` }] };
  });

  return {
    rouletteAnimationStyle,
    handleStart,
    isSpinning,
  };
}
