import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const CustomSwitch = ({
  value,
  onChange,
  disabled = false,
}: CustomSwitchProps) => {
  const [isOn, setIsOn] = useState(value);
  console.log("isOn", isOn);
  const initValue = Platform.OS === "web" ? 0 : 3;
  const lastValue = Platform.OS === "web" ? 30 : 33;
  const switchLeftValue = useRef(
    new Animated.Value(value ? lastValue : initValue)
  ).current;
  const toggleSwitch = () => {
    console.log(value, isOn, "check");
    const newValue = !isOn;
    if (disabled) {
      onChange(newValue);
      return;
    }

    setIsOn(newValue);
    onChange(newValue);
    Animated.timing(switchLeftValue, {
      toValue: newValue ? lastValue : initValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setIsOn(value);
    Animated.timing(switchLeftValue, {
      toValue: value ? lastValue : initValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <Pressable onPress={toggleSwitch} style={styles.switchContainer}>
      <View
        style={[
          styles.switch,
          { backgroundColor: isOn ? "#F3EDFF" : "#E5E0F1" }, // 더 흐린 색
        ]}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "transparent"]}
          style={styles.fakeInnerShadow}
          pointerEvents="none"
        />

        <Animated.View
          style={[
            styles.switchButton,
            {
              transform: [{ translateX: switchLeftValue }],
              backgroundColor: isOn ? "#7A4AE2" : "#B7A8E7", // 버튼 색도 다운톤으로
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  switch: {
    width: 60,
    height: 30,
    borderRadius: 20,
    position: "relative",
    padding: 4,
    overflow: "hidden",

    flexDirection: "row",
  },
  fakeInnerShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 1,
  },
  switchButton: {
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    width: 24,
    height: 24,
    borderRadius: 12,

    position: "absolute",
    top: 3,
    zIndex: 2,
  },
});

export default CustomSwitch;
