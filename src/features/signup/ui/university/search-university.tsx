import SearchIcon from "@assets/icons/search.svg";
import React, { useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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

  const animatedWidth = React.useRef(new Animated.Value(32)).current;
  const width = useWindowWidth();
  const searchWidth = width > 480 ? 436 : width - 32;
  const handleToggle = () => {
    Animated.timing(animatedWidth, {
      toValue: expanded ? 32 : searchWidth,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            width: animatedWidth,
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
            underlineColorAndroid="transparent" // Android용
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
