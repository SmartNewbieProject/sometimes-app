import colors from "@/src/shared/constants/colors";
import { ImageResources } from "@/src/shared/libs";
import { ImageResource, PurpleGradient, Text } from "@/src/shared/ui";
import CheckIcon from "@assets/icons/check-unchecked.svg";
import { transform } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Animated as EssetionAnimated, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMatchLoading } from "../hooks";
import { useLatestMatching } from "../queries";
import i18n from "@/src/shared/libs/i18n";
const processStep = [
  i18n.t("features.idle-match-timer.ui.rematching.steps.profile_analysis"),
  i18n.t("features.idle-match-timer.ui.rematching.steps.condition_check"),
  i18n.t("features.idle-match-timer.ui.rematching.steps.profile_search"),
  i18n.t("features.idle-match-timer.ui.rematching.steps.result_ready"),
];
export const RematchLoading = () => {
  const [stepCheck, setStepCheck] = useState(processStep.map((_) => false));
  const { loading: realRematchingLoading } = useMatchLoading();
  const [displayPercent, setDisplayPercent] = useState(0);

  const animations = useRef(
    processStep.map(() => ({
      opacity: new EssetionAnimated.Value(0),
      scale: new EssetionAnimated.Value(1),
    }))
  ).current;
  const barAnimations = useRef(new EssetionAnimated.Value(0)).current;

  const progressAnimations = useSharedValue(0);

  const animatedProgressStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(
      progressAnimations.value,
      [0, 25, 50, 75, 100],
      [0, 0.33, 0.55, 0.8, 1]
    );
    return {
      transform: [
        {
          scaleX,
        },
      ],
    };
  });
  const animatedStyle = processStep.map((step, index) => ({
    opacity: animations[index].opacity,
    transform: [
      {
        translateY: animations[index].opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  }));

  const animatedIconStyle = processStep.map((_, index) => ({
    transform: [
      {
        scale: animations[index].scale,
      },
    ],
  }));
  const animatedBarStyle = {
    transform: [
      {
        scaleY: barAnimations.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  useEffect(() => {
    progressAnimations.value = withTiming(100, { duration: 3800 });
  }, []);

  useEffect(() => {
    EssetionAnimated.timing(barAnimations, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true,
    }).start();

    processStep.forEach((_, index) => {
      setTimeout(() => {
        EssetionAnimated.timing(animations[index].opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        EssetionAnimated.sequence([
          EssetionAnimated.spring(animations[index].scale, {
            toValue: 1.2,
            friction: 4,
            useNativeDriver: true,
          }),
          EssetionAnimated.spring(animations[index].scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
        setStepCheck((prev) =>
          prev.map((item, idx) => (index === idx ? true : item))
        );
      }, index * 1000);
    });
  }, []);

  useAnimatedReaction(
    () => Math.floor(progressAnimations.value),
    (value, prev) => {
      if (value !== prev) {
        runOnJS(setDisplayPercent)(value);
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <PurpleGradient />
      <View style={styles.imageOutWrapper}>
        <View style={styles.imageInnerWrapper}>
          <ImageResource
            resource={ImageResources.SANDTIMER}
            width={112}
            height={112}
          />
        </View>
      </View>

      <Text style={styles.title} textColor="purple" weight="bold" size="20">
        {i18n.t("features.idle-match-timer.ui.rematching.title")}
      </Text>

      <View style={styles.stepContainer}>
        {processStep.map((step, index) => (
          <View key={step} style={styles.step}>
            {stepCheck[index] ? (
              <EssetionAnimated.View
                style={[styles.checkIconWrapper, animatedIconStyle[index]]}
              >
                <CheckIcon width={10} height={10} />
              </EssetionAnimated.View>
            ) : (
              <View style={styles.unChecked} />
            )}
            <EssetionAnimated.View style={animatedStyle[index]}>
              <Text size="sm" textColor="purple">
                {step}
              </Text>
            </EssetionAnimated.View>
          </View>
        ))}
        <View
          style={{
            height: "90%",
            position: "absolute",
            top: 0,
            width: 2,
            zIndex: 0,
          }}
        >
          <EssetionAnimated.View
            style={[
              styles.stepVerticalBar,
              animatedBarStyle,
              { transformOrigin: "top" },
            ]}
          />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progress,
            animatedProgressStyle,
            { transformOrigin: "left" },
          ]}
        />
      </View>
      <Text size="sm" textColor={"gray"}>
        {Math.floor(displayPercent) > 99 && realRematchingLoading
          ? 99
          : Math.floor(displayPercent)}
        %{i18n.t("features.idle-match-timer.ui.rematching.complete_text")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageInnerWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: "#CEC1FF",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOutWrapper: {
    width: 134,
    height: 134,
    borderRadius: "50%",
    borderColor: "#DCD3FF",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 10,
    marginBottom: 18,
  },
  checkIconWrapper: {
    alignItems: "center",

    justifyContent: "center",
    width: 16,
    borderRadius: "50%",
    backgroundColor: colors.primaryPurple,
    height: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 3,
  },
  stepContainer: {
    gap: 11,
    position: "relative",
  },
  stepVerticalBar: {
    width: 2,
    top: 4,

    left: 7,
    position: "absolute",
    height: "90%",
    backgroundColor: "#C5B2FF",
  },
  unChecked: {
    width: 16,
    height: 16,
    backgroundColor: "transparent",
  },
  progressContainer: {
    width: "75%",
    position: "relative",
    height: 5,
    borderRadius: 20,
    backgroundColor: "#ECECEC",
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 5,
  },
  progress: {
    width: "100%",
    top: 0,
    left: 0,
    height: 5,
    borderRadius: 20,
    backgroundColor: colors.primaryPurple,
    position: "absolute",
  },
});
