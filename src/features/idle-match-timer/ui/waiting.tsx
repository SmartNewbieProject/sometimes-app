import { dayUtils } from "@/src/shared/libs";
import { IconWrapper } from "@/src/shared/ui/icons";
import ArrowRight from "@assets/icons/right-white-arrow.svg";
import { Text } from "@shared/ui";
import { useRouter } from "expo-router";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Time } from ".";
import { useAuth } from "../../auth";
import { type TimeResult, calculateTime } from "../services/calculate-time";
import type { MatchDetails } from "../types";
import { sideStyle } from "./constants";
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";


interface WaitingProps {
  onTimeEnd?: () => void;
  match: Pick<MatchDetails, 'type' | 'untilNext'> & { untilNext: string };
}

export const Waiting = ({ match, onTimeEnd }: WaitingProps) => {
  const { my, profileDetails } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const userName = profileDetails?.name ?? my?.name;
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());
  const trigger = useRef(false);
  const [timeSet, setTimeSet] = useState<TimeResult>(() => {
    return calculateTime(match.untilNext, currentTime);
  });

  const fire = () => {
    trigger.current = true;
    onTimeEnd?.();
  };

  const updateTime = useCallback(() => {
    if (trigger.current) return;

    const now = dayUtils.create();
    setCurrentTime(now);

    const { shouldTriggerCallback, value, delimeter } = calculateTime(
      match.untilNext,
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
  }, [match.untilNext, onTimeEnd]);

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
        style={styles.sandclockImage}
      />
      <View style={styles.titleContainer}>
        <Text
          size="18"
          textColor="black"
          weight="semibold"
          style={styles.titleText}
        >
          {t("features.idle-match-timer.ui.waiting.title_1",{name:my?.name})}
        </Text>
        <Text size="18" textColor="black" weight="semibold">
          {t("features.idle-match-timer.ui.waiting.title_2")}
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <Time value={timeSet.delimeter} />
        <Time value="-" />
        {timeSet.value
          .toString()
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
          style={styles.descriptionText1}
        >
          {t("features.idle-match-timer.ui.waiting.description_2")}
        </Text>
        <Text
          size="18"
          textColor="pale-purple"
          weight="normal"
          style={styles.descriptionText2}
        >
          {t("features.idle-match-timer.ui.waiting.description_3")}
        </Text>
      </View>

      <View style={sideStyle.previousContainer}>
        <View style={styles.bgSurfaceRelative}>
          <View style={sideStyle.topRadius} />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[sideStyle.previousButton, styles.previousButtonContent]}
            onPress={() => router.push("/matching-history")}
          >
            <Text style={styles.previousButtonText} textColor="white">{t("features.idle-match-timer.ui.waiting.previous_button")}</Text>
            <IconWrapper width={12} height={12}>
              <ArrowRight />
            </IconWrapper>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>
        <View style={styles.bgSurfaceRelative}>
          <View style={sideStyle.bottomRadius} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  sandclockImage: {
    width: 72,
    height: 82,
  },
  titleContainer: {
    marginVertical: 8,
  },
  titleText: {
    marginBottom: 2,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  descriptionText1: {
    marginTop: 4,
  },
  descriptionText2: {
    marginTop: 8,
  },
  bgSurfaceRelative: {
    width: "100%",
    backgroundColor: semanticColors.surface.secondary,
    position: "relative",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
  },
  previousButtonContent: {
    backgroundColor: semanticColors.brand.primary,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 4,
  },
  previousButtonText: {
    width: 24,
    fontSize: 12,
  },
  spacer: {
    width: 16,
    backgroundColor: semanticColors.surface.secondary,
    height: "100%",
  },
});
