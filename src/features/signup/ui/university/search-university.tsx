import SearchIcon from "@assets/icons/search.svg";
import type React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useWindowWidth } from "../../hooks";

interface SearchUniversityProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

function SearchUniversity({
  searchText,
  setSearchText,
}: SearchUniversityProps) {
  const width = useWindowWidth();
  const searchWidth = width > 480 ? 436 : width - 48;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { width: searchWidth }]}>
        <TextInput
          className="outline-none"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="대학교 이름을 검색해주세요"
          placeholderTextColor="#999"
          style={styles.input}
          underlineColorAndroid="transparent"
          autoFocus
        />
        <View style={styles.iconWrapper}>
          <SearchIcon width={20} height={20} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  searchContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0D7F5",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
    color: "#000",
    marginRight: 8,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchUniversity;
