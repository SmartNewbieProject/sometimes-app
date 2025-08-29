import { StyleSheet, Text, View } from "react-native";
import type { Chat } from "../../types/chat";

const SystemMessage = ({ item }: { item: Chat }) => (
  <View style={styles.dateDividerContainer}>
    <Text style={styles.dateText}>{item.content}</Text>
  </View>
);

const styles = StyleSheet.create({
  dateDividerContainer: {
    alignItems: "center",
    marginVertical: 5,
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
