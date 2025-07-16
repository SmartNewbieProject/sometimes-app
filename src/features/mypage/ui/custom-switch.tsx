import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
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
}

const CustomSwitch = ({ value, onChange }: CustomSwitchProps) => {
  const [isOn, setIsOn] = useState(value);
  const switchLeftValue = useRef(new Animated.Value(value ? 3 : 33)).current;
  console.log(switchLeftValue, "value");
  const toggleSwitch = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange(newValue);
    console.log("1", switchLeftValue);
    Animated.timing(switchLeftValue, {
      toValue: newValue ? 4 : 32,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={toggleSwitch} style={styles.switchContainer}>
      <View style={[styles.switch]}>
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "transparent"]}
          style={styles.fakeInnerShadow}
          pointerEvents="none"
        />

        <Animated.View
          style={[
            styles.switchButton,
            { transform: [{ translateX: switchLeftValue }] },
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
    backgroundColor: "#F3EDFF",
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
    backgroundColor: "#7A4AE2",
    position: "absolute",
    top: 3,
    zIndex: 2,
  },
});

export default CustomSwitch;
