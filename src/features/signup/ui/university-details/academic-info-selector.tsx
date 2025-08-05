import React from "react";
import { StyleSheet, View } from "react-native";
import GradeSelector from "./grade-selector";
import StudentIdSelector from "./student-id-selector";

function AcademicInfoSelector() {
  return (
    <View style={styles.container}>
      <StudentIdSelector />
      <GradeSelector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default AcademicInfoSelector;
