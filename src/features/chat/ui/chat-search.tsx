import WhiteXIcon from "@assets/icons/chat-search-x.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import SearchIcon from "@assets/icons/search-chat.svg";
import type React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

interface ChatSearchProps {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
}

function ChatSearch({ keyword, setKeyword }: ChatSearchProps) {
  const { t } = useTranslation();
  const handleResetKeyword = () => {
    setKeyword("");
  };
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <SearchIcon />
        <TextInput
          value={keyword}
          placeholder={t("features.chat.ui.search.placeholder")}
          placeholderTextColor={"#AEA3D6"}
          style={styles.input}
          onChangeText={(text) => setKeyword(text)}
        />
        {keyword !== "" ? (
          <Pressable style={styles.reset} onPress={handleResetKeyword}>
            <WhiteXIcon />
          </Pressable>
        ) : (
          <View
            style={[{ backgroundColor: "transparent", width: 20, height: 20 }]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  container: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: semanticColors.surface.secondary,
    gap: 10,
  },
  input: {
    fontSize: 18,
    borderWidth: 0,
    outlineWidth: 0,
    flex: 1,
    lineHeight: 20,
    color: semanticColors.text.primary,
  },
  reset: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    borderRadius: 9,
  },
});

export default ChatSearch;
