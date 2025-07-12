import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export interface Tab {
  id: "profile" | "interest";
  label: string;
}

interface ToggleTabProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: () => void;

  style?: ViewStyle;
}

export const ToggleTab = ({
  tabs,
  activeTab,
  onTabClick,

  style,
}: ToggleTabProps) => {
  const leftAnim = useRef(
    new Animated.Value(activeTab === "profile" ? 5 : 100)
  ).current;
  const widthAnim = useRef(
    new Animated.Value(activeTab === "profile" ? 87 : 57)
  ).current;
  const handleTabChange = () => {
    const anim1 = Animated.timing(widthAnim, {
      useNativeDriver: false,
      delay: 30,
      toValue: activeTab === "profile" ? 57 : 87,
    });
    const anim2 = Animated.timing(leftAnim, {
      useNativeDriver: false,
      delay: 30,
      toValue: activeTab === "profile" ? 100 : 5,
    });

    Animated.parallel([anim1, anim2]).start();
    setTimeout(() => {
      onTabClick();
    }, 400);
  };
  console.log("active", activeTab);
  return (
    <Pressable style={styles.container} onPress={() => handleTabChange()}>
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "transparent"]}
        style={styles.fakeInnerShadow}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.toggle,
          { width: widthAnim },
          { transform: [{ translateX: leftAnim }] },
        ]}
      />
      <View style={styles.textContainer}>
        {tabs.map((tab) => {
          return (
            <Text
              style={[
                styles.text,
                { color: activeTab === tab.id ? "#fff" : "#7A4AE2" },
              ]}
              key={tab.id}
            >
              {tab.label}
            </Text>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 163,
    height: 50,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F3EDFF",
    flexDirection: "row",
    alignItems: "center",
  },
  fakeInnerShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
  toggle: {
    width: 87,
    height: 40,
    alignItems: "center",
    position: "absolute",
    backgroundColor: "#7A4AE2",
    justifyContent: "center",
    borderRadius: 16,
  },
  textContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    width: "100%",
    gap: 26,
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 18,
  },
});
