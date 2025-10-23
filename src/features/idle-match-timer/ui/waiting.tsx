import { useCommingSoon } from "@/src/features/admin/hooks";
import { dayUtils } from "@/src/shared/libs";
import { IconWrapper } from "@/src/shared/ui/icons";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { Text } from "@shared/ui";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Time } from ".";
import { useAuth } from "../../auth";
import { type TimeResult, calculateTime } from "../services/calculate-time";
import type { MatchDetails } from "../types";
import { sideStyle } from "./constants";

interface WaitingProps {
  onTimeEnd?: () => void;
  match: MatchDetails;
}

export const Waiting = ({ match, onTimeEnd }: WaitingProps) => {
  const { my } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());
  const trigger = useRef(false);
  const [timeSet, setTimeSet] = useState<TimeResult | null>(() => {
    if (!match || !match.untilNext) return null;
    const test = dayUtils.create().add(1, "minute");
    // return calculateTime(test, currentTime);
    const nextMatchingDate = dayUtils.create(match.untilNext);
    return calculateTime(nextMatchingDate, currentTime);
  });
  const showCommingSoon = useCommingSoon();

  // const time = calculateTime(dayUtils.create(match.untilNext), currentTime);

  const fire = () => {
    trigger.current = true;
    onTimeEnd?.();
  };

  const updateTime = useCallback(() => {
    if (trigger.current) return;
    if (!match || !match.untilNext) return;
    const { untilNext } = match;
    const nextMatchingDate = dayUtils.create(untilNext);
    if (currentTime.isSame(nextMatchingDate, "second")) {
      fire();
      return;
    }

    const now = dayUtils.create();
    setCurrentTime(now);
    const { shouldTriggerCallback, value, delimeter } = calculateTime(
      nextMatchingDate,
      now
    );
    setTimeSet({
      shouldTriggerCallback,
      value,
      delimeter,
    });
    if (shouldTriggerCallback && onTimeEnd) {
      fire();
    }
  }, [match, onTimeEnd]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [updateTime]);

  return (
    <View className="p-[14px]">
      <Image
        source={require("@assets/images/sandclock.png")}
        style={{ width: 72, height: 82 }}
      />
      <View className="my-[8px]">
        <Text
          size="18"
          textColor="black"
          weight="semibold"
          className="mb-[2px]"
        >
          {my?.name}님
        </Text>
        <Text size="18" textColor="black" weight="semibold">
          이상형 매칭까지
        </Text>
      </View>

      <View className="flex flex-row gap-x-1 mb-[8px]">
        <Time value={timeSet?.delimeter || ""} />
        <Time value="-" />
        {timeSet?.value
          ?.toString()
          .split("")
          .map((value, key) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Time key={value + key} value={value} />
          ))}
      </View>

      <View>
        <Text
          size="18"
          textColor="black"
          weight="semibold"
          className="mt-[4px]"
        >
          남았어요
        </Text>
        <Text
          size="18"
          textColor="pale-purple"
          weight="normal"
          className="mt-[8px]"
        >
          매주 목·일 21시에 매칭이 시작돼요!
        </Text>
      </View>

      <View style={sideStyle.previousContainer}>
        <View className="w-full bg-[#fcfaff] relative">
          <View style={sideStyle.topRadius} />
        </View>
        <View className="w-full flex flex-row">
          <TouchableOpacity
            className="bg-primaryPurple flex-1 flex flex-row justify-end items-center pr-1"
            style={sideStyle.previousButton}
            onPress={() => router.push("/matching-history")}
          >
            <Text className="w-[24px] text-white text-[12px]">이전 매칭</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
          <View className="w-[16px] bg-[#fcfaff] h-full" />
        </View>
        <View className="w-full bg-[#fcfaff] relative">
          <View style={sideStyle.bottomRadius} />
        </View>
      </View>
    </View>
  );
};
