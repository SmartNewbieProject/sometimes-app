import { Show, Text } from "@/src/shared/ui";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import { useMatchingHistoryList } from "../queries/use-matching-history-list";
import MatchingHistoryCard from "./matching-history-card";

function MatchingHistoryList() {
  const { matchingHistoryList } = useMatchingHistoryList();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {matchingHistoryList && matchingHistoryList.length > 0 && (
        <FlashList
          data={matchingHistoryList}
          renderItem={({ item }) => <MatchingHistoryCard item={item} />}
          estimatedItemSize={200}
          numColumns={2}
        />
      )}

      <Show when={!!matchingHistoryList && matchingHistoryList.length < 3}>
        <View style={[styles.info, { flex: 1 }]}>
          <Image
            style={styles.image}
            source={require("@assets/images/love-letter.png")}
          />
          <Text size="md" textColor={"purple"} style={styles.infoText}>
            {t(
              "features.matching-history.ui.matching_history_list.more_matches_prompt"
            )}
          </Text>
          <Text size="md" textColor={"purple"} style={styles.infoText}>
            {t(
              "features.matching-history.ui.matching_history_list.use_rematch_hint"
            )}
          </Text>
        </View>
      </Show>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    marginTop: 16,
  },
  info: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
  },
  image: {
    width: 166,
    height: 148,
  },
});

export default MatchingHistoryList;