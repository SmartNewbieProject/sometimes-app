import { Show, Text } from "@/src/shared/ui";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useMatchingHistoryList } from "../queries/use-matching-history-list";
import MatchingHistoryCard from "./matching-history-card";

function MatchingHistoryList() {
  const { matchingHistoryList } = useMatchingHistoryList();

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
            더 많은 매칭을 원하시나요?
          </Text>
          <Text size="md" textColor={"purple"} style={styles.infoText}>
            지금 재매칭권을 사용해 새로운 인연을만나보세요!"
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
  },
  image: {
    width: 166,
    height: 148,
  },
});

export default MatchingHistoryList;
