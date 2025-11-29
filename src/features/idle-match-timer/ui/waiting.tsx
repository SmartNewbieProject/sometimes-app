import { useCommingSoon } from "@/src/features/admin/hooks";
import { dayUtils } from "@/src/shared/libs";
import { IconWrapper } from "@/src/shared/ui/icons";
import { semanticColors } from "@/src/shared/constants/colors";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { Text } from "@shared/ui";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Time from "./time";
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
    <View style={styles.container}>
      <Image
        source={require("@assets/images/sandclock.png")}
        style={{ width: 72, height: 82 }}
      />
      <View style={styles.nameSection}>
        <Text
          size="18"
          textColor="black"
          weight="semibold"
          style={styles.nameText}
        >
          {my?.name}님
        </Text>
        <Text size="18" textColor="black" weight="semibold">
          이상형 매칭까지
        </Text>
      </View>

      <View style={styles.timeContainer}>
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
          style={styles.remainingText}
        >
          남았어요
        </Text>
        <Text
          size="18"
          textColor="pale-purple"
          weight="normal"
          style={styles.scheduleText}
        >
          매주 목·일 21시에 매칭이 시작돼요!
        </Text>
      </View>

      <View style={sideStyle.previousContainer}>
        <View style={styles.topSection}>
          <View style={sideStyle.topRadius} />
        </View>
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[sideStyle.previousButton, styles.previousButton]}
            onPress={() => router.push("/matching-history")}
          >
            <Text style={styles.previousButtonText}>이전 매칭</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>
        <View style={styles.bottomSection}>
          <View style={sideStyle.bottomRadius} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14
  },
  nameSection: {
    marginVertical: 8
  },
  nameText: {
    marginBottom: 2
  },
  timeContainer: {
    flexDirection: 'row',
    columnGap: 4,
    marginBottom: 8
  },
  remainingText: {
    marginTop: 4
  },
  scheduleText: {
    marginTop: 8
  },
  topSection: {
    width: '100%',
    backgroundColor: semanticColors.surface.background,
    position: 'relative'
  },
  buttonSection: {
    width: '100%',
    flexDirection: 'row'
  },
  previousButton: {
    backgroundColor: '#7A4AE2',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 4
  },
  previousButtonText: {
    width: 24,
    color: semanticColors.text.inverse,
    fontSize: 12
  },
  spacer: {
    width: 16,
    backgroundColor: semanticColors.surface.background,
    height: '100%'
  },
  bottomSection: {
    width: '100%',
    backgroundColor: semanticColors.surface.background,
    position: 'relative'
  }
});
