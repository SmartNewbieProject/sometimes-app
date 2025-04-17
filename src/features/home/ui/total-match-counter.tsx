import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Text } from "@/src/shared/ui";

interface TotalMatchCounterProps {
  count: number;
}

export default function TotalMatchCounter({
  count
}: TotalMatchCounterProps) {
  const [_count, setCount] = useState<number>(count);
  const formattedCount = _count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
