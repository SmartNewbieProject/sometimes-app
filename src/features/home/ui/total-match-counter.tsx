import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Image } from "expo-image";
import { Text } from "@/src/shared/ui";

interface TotalMatchCounterProps {
  count: number;
}

export default function TotalMatchCounter({
  count
}: TotalMatchCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isFirstRender = useRef(true);
  const finalCountRef = useRef(count);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formattedCount = formatNumber(displayValue);

  useEffect(() => {
    // Update the final count reference
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
        useNativeDriver: false,
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
      <View style={styles.contentContainer} className="whitespace-nowrap">
        <View style={styles.leftContent} className="w-full flex flex-row">
          <Text textColor="white" className="mb-1 whitespace-nowrap text-sm md:text-md pt-5 pr-1">지금까지</Text>
          <View style={styles.counterContainer} className="self-center">
            <Text weight="bold" textColor="white" className="text-[42px] tracking-wide font-rubik">{formattedCount}</Text>
          </View>
          <Text textColor="white" className="self-end text-sm md:text-md pb-[19px]">명이 신청했어요!</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    width: "100%",
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  leftContent: {
    flex: 1,
    justifyContent: "center",
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  heartIcon: {
    width: 40,
    height: 40,
  }
});
