import SearchIcon from "@assets/icons/search.svg";
import type React from "react";
import { useState } from "react";
import {
  Easing,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useWindowWidth } from "../../hooks";

interface SearchUniversityProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

function SearchUniversity({
  searchText,
  setSearchText,
}: SearchUniversityProps) {
  const [expanded, setExpanded] = useState(false);

  const animatedWidth = useSharedValue(32);
  const width = useWindowWidth();
  const searchWidth = width > 480 ? 436 : width - 32;

  const widthStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value,
    };
  });

  const handleToggle = () => {
    animatedWidth.value = withTiming(expanded ? 32 : searchWidth, {
      duration: 300,
    });
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          widthStyle,
          {
            backgroundColor: expanded ? "#FFFFFF" : "#F3EDFF",
            borderColor: "#F3EDFF",
            flexDirection: "row",
            paddingHorizontal: expanded ? 12 : 0,
          },
        ]}
      >
        {expanded && (
          <TextInput
            className="outline-none"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="대학교 검색"
            placeholderTextColor="#999"
            style={styles.input}
            underlineColorAndroid="transparent"
            autoFocus
          />
        )}
        <TouchableWithoutFeedback onPress={handleToggle}>
          <View style={styles.iconWrapper}>
            <SearchIcon width={14} height={14} />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    height: 32,
    alignSelf: "flex-end",
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    fontSize: 14,
    height: 32,
    paddingVertical: 0,
    color: "#000",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    paddingLeft: 1,
    top: 0,
  },
  container: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
});

export default SearchUniversity;
