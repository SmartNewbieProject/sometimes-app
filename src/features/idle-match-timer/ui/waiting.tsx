import { useCommingSoon } from "@/src/features/admin/hooks";
import { dayUtils } from "@/src/shared/libs";
import { IconWrapper } from "@/src/shared/ui/icons";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { Text } from "@shared/ui";
import { useRouter } from "expo-router";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Time } from ".";
import { useAuth } from "../../auth";
import { type TimeResult, calculateTime } from "../services/calculate-time";
import type { MatchDetails } from "../types";
import { sideStyle } from "./constants";
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";


interface WaitingProps {
  onTimeEnd?: () => void;
  match: MatchDetails;
}

export const Waiting = ({ match, onTimeEnd }: WaitingProps) => {
  const { my } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
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
          {t("features.idle-match-timer.ui.waiting.title_1",{name:my?.name})}
        </Text>
        <Text size="18" textColor="black" weight="semibold">
          {t("features.idle-match-timer.ui.waiting.title_2")}
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
          {t("features.idle-match-timer.ui.waiting.description_2")}
        </Text>
        <Text
          size="18"
          textColor="pale-purple"
          weight="normal"
          className="mt-[8px]"
        >
          {t("features.idle-match-timer.ui.waiting.description_3")}
        </Text>
      </View>

      <View style={sideStyle.previousContainer}>
        <View className="w-full bg-surface-background relative">
          <View style={sideStyle.topRadius} />
        </View>
        <View className="w-full flex flex-row">
          <TouchableOpacity
            className="bg-primaryPurple flex-1 flex flex-row justify-end items-center pr-1"
            style={sideStyle.previousButton}
            onPress={() => router.push("/matching-history")}
          >
            <Text className="w-[24px] text-text-inverse text-[12px]">{t("features.idle-match-timer.ui.waiting.previous_button")}</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
          <View className="w-[16px] bg-surface-background h-full" />
        </View>
        <View className="w-full bg-surface-background relative">
          <View style={sideStyle.bottomRadius} />
        </View>
      </View>
    </View>
  );
};
