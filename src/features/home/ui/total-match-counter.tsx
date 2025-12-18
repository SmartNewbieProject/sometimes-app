import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface TotalMatchCounterProps {
  count: number;
}

export default function TotalMatchCounter({
  count,
}: TotalMatchCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslation();

  const isFirstRender = useRef(true);
  const finalCountRef = useRef(count);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formattedCount = formatNumber(displayValue);

  useEffect(() => {
    finalCountRef.current = count;

    // Set up listener for animated value changes
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    // Prevent animation from restarting if already animating
    if (!isAnimating) {
      setIsAnimating(true);

      if (isFirstRender.current) {
        animatedValue.setValue(0);
        isFirstRender.current = false;
      } else {
        animatedValue.setValue(displayValue);
      }

      Animated.timing(animatedValue, {
        toValue: count,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayValue(finalCountRef.current);
          setIsAnimating(false);
        }
      });
    }

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [count]);

  return (
    <LinearGradient
      colors={["#AB69B0", "#7A4AE2", "#D86B89"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      locations={[0, 0.2853, 1]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textRow}>
          <Text
            textColor="white"
            size="sm"
            style={styles.prefixText}
          >
            {t("features.home.ui.total_match_counter.count_prefix")}
          </Text>
          <View style={styles.counterContainer}>
            <Text
              weight="bold"
              textColor="white"
              style={styles.counterText}
            >
              {formattedCount}
            </Text>
          </View>
          <Text
            textColor="white"
            size="sm"
            style={styles.suffixText}
          >
            {t("features.home.ui.total_match_counter.count_suffix")}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    width: "99%",
    minHeight: 90,
    borderWidth: 1.5,
    borderColor: "#FFF",
    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  prefixText: {
    paddingTop: 20,
    paddingRight: 4,
    marginBottom: 4,
  },
  counterContainer: {
    alignSelf: "center",
    justifyContent: "center",
  },
  counterText: {
    fontSize: 34,
    letterSpacing: 0.8,
    fontFamily: "Rubik-Bold",
  },
  suffixText: {
    alignSelf: "flex-end",
    paddingBottom: 19,
  },
});