import SearchIcon from "@assets/icons/search.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useWindowWidth } from "../../hooks";

interface SearchUniversityProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

function SearchUniversity({
  searchText,
  setSearchText,
}: SearchUniversityProps) {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const searchWidth = width > 480 ? 436 : width - 48;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { width: searchWidth }]}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t("common.대학교_이름을_검색해주세요")}
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
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
    color: semanticColors.text.primary,
    marginRight: 8,
    outlineStyle: "none",
  } as any,
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchUniversity;