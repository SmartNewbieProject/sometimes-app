import { View, TouchableOpacity, Image } from "react-native";
import { Text } from '@shared/ui';
import { Time } from ".";
import { useAuth } from "../../auth";
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { IconWrapper } from '@/src/shared/ui/icons';
import { dayUtils } from '@/src/shared/libs';
import { calculateTime } from '../services/calculate-time';
import { useCallback, useEffect, useState } from 'react';
import { MatchDetails } from "../types";
import { sideStyle } from "./constants";

interface WaitingProps {
  onTimeEnd?: () => void;
  match: MatchDetails;
}

export const Waiting = ({ match, onTimeEnd }: WaitingProps) => {
  const { my } = useAuth();
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());

  const time = calculateTime(null, currentTime);

  const updateTime = useCallback(() => {
    if (!match || !match.endOfView) return;
    const { endOfView } = match;

    if (currentTime.isSame(endOfView, 'second')) {
      return;
    }

    const now = dayUtils.create();
    setCurrentTime(now);
    const { shouldTriggerCallback } = calculateTime(endOfView, now);
    if (shouldTriggerCallback && onTimeEnd) {
      onTimeEnd();
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
    <>
      <Image
        source={require('@assets/images/sandclock.png')}
        style={{ width: 72, height: 82 }}
      />
      <View className="my-[8px]">
        <Text size="md" textColor="black" weight="semibold">
          {my?.name}님
        </Text>
        <Text size="md" textColor="black" weight="semibold">
          이상형 매칭까지
        </Text>
      </View>

      <View className="flex flex-row gap-x-1 mb-[8px]">
        <Time value={time.delimeter} />
        <Time value="-" />
        {time.value?.toString().split('').map((value, index) => (
          <Time key={index} value={value} />
        ))}
      </View>

      <View>
        <Text size="md" textColor="black" weight="semibold">
          남았어요
        </Text>
        <Text size="sm" textColor="pale-purple" weight="light" className="mt-[8px]">
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
          >
            <Text className="w-[24px] text-white text-[12px]">
              이전
              매칭
            </Text>
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
    </>
  )
};
