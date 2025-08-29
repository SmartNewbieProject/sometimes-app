import { StyleSheet, Text, View } from "react-native";

const DateDivider = ({ date }: { date: string }) => (
  <View style={styles.dateDividerContainer}>
    <Text style={styles.dateText}>{date}</Text>
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
    backgroundColor: "#fff",
    borderRadius: 20,
  },
});

export default DateDivider;
