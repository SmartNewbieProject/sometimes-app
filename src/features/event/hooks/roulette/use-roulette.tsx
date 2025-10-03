import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { postRouletteSpin } from "../../api";
import { rouletteModalStrategy } from "../../service/roulette-modal-strategy";
import { rouletteSpinErrorHandlers } from "../../service/roulette-spin-error-handler";
import type { RouletteResponse } from "../../types";

// 전체 칸 숫자
const NUMBER_OF_SLICES = 12;

// 룰렛이 돌아가는 최소 시간 보장을 위해서
const MIN_SPIN_DURATION = 3000;
// 백엔드에서 값을 결정해주고 나서 멈추기 까지 여유 시간
const SETTLE_DURATION = 1500;

// 타임아웃
const API_TIMEOUT = 5000;

// 피그마에 있던 순서대로 0은 꽝
const PRIZE_MAP = [1, 0, 2, 0, 1, 0, 3, 0, 4, 0, 5, 0];

export function useRoulette() {
  const rouletteValue = useSharedValue(0);
  const { showNestedModal, hideModal, hideNestedModal, showNestedErrorModal } =
    useModal();
  const router = useRouter();
  useEffect(() => {
    return () => {
      cancelAnimation(rouletteValue);
    };
  }, [rouletteValue]);

  const showModalForPrize = (prizeValue: number) => {
    const modalStrategy = rouletteModalStrategy(showNestedModal, () => {
      hideModal();
      hideNestedModal();
    });
    modalStrategy[prizeValue as keyof typeof modalStrategy]();
  };

  const settleRoulette = (prizeValue: number) => {
    const possibleIndices: number[] = [];
    PRIZE_MAP.forEach((value, index) => {
      if (value === prizeValue) {
        possibleIndices.push(index);
      }
    });

    const finalIndex =
      possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    const sliceAngle = 360 / NUMBER_OF_SLICES;
    const targetAngleForSlice = -sliceAngle * finalIndex;
    const fullSpins = 2;
    const finalTargetAngle = 360 * fullSpins + targetAngleForSlice;

    rouletteValue.value = withTiming(
      finalTargetAngle,
      {
        duration: SETTLE_DURATION,
        easing: Easing.out(Easing.cubic),
      },
      (isFinished) => {
        if (isFinished) {
          runOnJS(showModalForPrize)(prizeValue);
        }
      }
    );
  };

  const rouletteMutation = useMutation({
    mutationFn: async () => {
      const minTimePromise = new Promise<void>((resolve) =>
        setTimeout(resolve, MIN_SPIN_DURATION)
      );
      const apiPromise = Promise.race([
        postRouletteSpin(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("API 응답 시간 초과")), API_TIMEOUT)
        ),
      ]);
      return Promise.all([apiPromise, minTimePromise]).then(([apiResult]) => {
        return apiResult as RouletteResponse;
      });
    },

    onMutate: () => {
      rouletteValue.value = 0;
      rouletteValue.value = withRepeat(
        withTiming(360, { duration: 500, easing: Easing.linear }),
        -1
      );
    },

    onSuccess: async (response) => {
      console.log(`API 성공! 결과: ${response.prizeValue}`);
      await queryClient.invalidateQueries({ queryKey: ["gem", "current"] });
      cancelAnimation(rouletteValue);
      runOnJS(settleRoulette)(response.prizeValue);
    },

    onError: (error: {
      error: string;
      message: string;
      statusCode: number;
      status: number;
    }) => {
      console.error("룰렛 회전 실패:", error.message);
      cancelAnimation(rouletteValue);
      rouletteValue.value = withTiming(0, { duration: 100 });
      const status = error.statusCode;
      const handler =
        rouletteSpinErrorHandlers[status] || rouletteSpinErrorHandlers.default;

      handler.handle(error, {
        router,
        showModal: showNestedModal,
        showErrorModal: showNestedErrorModal,
      });
    },
  });

  const handleStart = () => {
    if (rouletteMutation.isPending) return;

    rouletteMutation.mutate();
  };

  const rouletteAnimationStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${rouletteValue.value}deg` }] };
  });

  return {
    rouletteAnimationStyle,
    handleStart,
    isSpinning: rouletteMutation.isPending,
  };
}
