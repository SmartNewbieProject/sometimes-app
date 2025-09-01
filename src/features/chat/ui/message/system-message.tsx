import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Chat } from "../../types/chat";

const SystemMessage = ({ item }: { item: Chat }) => {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["chat-detail", id] });
  }, []);
  return (
    <View style={styles.dateDividerContainer}>
      <Text style={[styles.dateText, { fontSize: 14 }]}>안내</Text>
      <Text style={[styles.dateText, { paddingVertical: 2 }]}>
        상대방이 채팅방을 나갔어요.
      </Text>
      <Text style={[styles.dateText, { paddingVertical: 2 }]}>
        서로의 선택을 존중하며 대화를 마무리할게요.
      </Text>

      <Text style={[styles.dateText, { paddingVertical: 2 }]}>
        새로운 인연을 만나보는 건 어떨까요?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dateDividerContainer: {
    alignItems: "center",
    marginVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,

    borderRadius: 10,

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#73727566",
  },
  dateText: {
    fontSize: 13,
    color: "#898A8D",
    fontWeight: "400",

    paddingHorizontal: 9,
    paddingVertical: 4,
  },
});

export default SystemMessage;
